const router = require('express').Router();
const User = require('../Models/User')
const { body, validationResult } = require('express-validator'); //validation of user using 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "manishgupta$goodboy";
//validation of array between path  [] and (req,res)
var validationforRegistration = [
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('email', 'enter a valid email id').isEmail(),
    body('password', 'password should be minimum length 5').isLength({ min: 5 }),
]


// Route 1:    //Create a user string : POST  "/api/auth/createuser". Does't require login
router.post('/createuser', validationforRegistration, async (req, res) => {

    let success=false;
    //if there are errors, return bad request and then error
    const errors = validationResult(req);

    //is any error then send bad request 400
    if (!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    try {
        //check whether the user already exists
        let user = await User.findOne({ email: req.body.email }) //this line = if user already in the db then return the user details otherwise return null
        // if user exist then send bad request using json format
        // console.log("user data using findOne()");
        // console.log(user);
        if (user) {

            return res.status(400).json({success, error: "sorry this user with same email already exist" })
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        //create a new user 
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        });
        const data = {
            user: {
                id: user.id
            }
        }
        // console.log(user.id);
        const authtoken = jwt.sign(data, JWT_SECRET)
        // console.log(authtoken);
        success=true;
        res.json({ success,authtoken })
        //send respose the user details that user fill the form
        // res.json(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})


// Route 2:

//Authenticate a user using : POST "/api/auth/login" no login required
var validationforLogin = [
    body('email', 'enter a valid email id').isEmail(),
    body('password', 'password cannot be blank').exists(),
]
router.post('/login', validationforLogin, async (req, res) => {
        
    let success=false;
    //if there are errors, return bad request and then error
    const errors = validationResult(req);

    //is any error then send bad request 400
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        //check whether the user already exists
        let user = await User.findOne({ email })
        console.log("get login email with findOne");
        console.log(user);
        // if user exist then send bad request using json format
        if (!user) {
            success=false;
            return res.status(400).json({ error: "Please try to login with correct credentials" })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            success=false
            return res.status(400).json({ success,errors: "Please try to login with correct credentials" })
        }


        const data = {
            user: {
                id: user.id
            }
        }
        // console.log(user.id);
        const authtoken = jwt.sign(data, JWT_SECRET)
        // console.log(authtoken);
        success=true;
        res.json({ success,authtoken })
        //send respose the user details that user fill the form
        // res.json(user)

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})

//Route 3: Get logined user Detailes Using POST "/api/auth/login"   login required

router.post("/getuser", fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("get the user id from jwt")
        console.log(userId);
        const user = await User.findById(userId).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})

module.exports = router;