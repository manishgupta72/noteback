const router = require('express').Router();
const fetchuser = require('../middleware/fetchuser');
const Notes = require('../Models/Notes')
const { body, validationResult } = require('express-validator'); //validation of user using 

// Route 1:    //fetch all notes of the user string : get  "/api/auth/fetchallnotes".  require login
router.get('/fetchallnotes', fetchuser, async(req, res) => {

        try {
            const notes = await Notes.find({ user: req.user.id })

            res.json(notes);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server error")
        }
    })
    // Route 2:    //add note the user  : Post  "/api/auth/addnote".  require login
var validationforAddNote = [
    body('title', 'enter a valid title').isLength({ min: 3 }),
    body('description', 'description must be atleat 5 Length').isLength({ min: 5 }),

]
router.post('/addnote', fetchuser, validationforAddNote, async(req, res) => {


    try {
        //if there are errors, return bad request and then error
        const errors = validationResult(req);

        // console.log(req)  to see what content in the req
        //is any error then send bad request 400
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, tag } = req.body;
        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        })
        const savedNote = await note.save();

        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})



// Route 3:    //update note the user  : PUT  "/api/auth/updatenote".  require login

router.put('/updatenote/:id', fetchuser, async(req, res) => {
        try {

            const { title, description, tag } = req.body;
            //create a note object
            const newNote = {};
            if (title) { newNote.title = title };
            if (description) { newNote.description = description };
            if (tag) { newNote.tag = tag };

            //find the note to be updated and update it
            let note = await Notes.findById(req.params.id) //get old notes by id
            console.log(note);
            if (!note) { return res.status(404).send("Not Found") }
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not Allowed"); 
             }
            note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
            res.json({ note })


        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server error")
        }
    })
    // Route 4:    //delete note the user  : delete  "/api/auth/deletenote".  require login

router.delete('/deletenote/:id', fetchuser, async(req, res) => {
    try {

        //find the user note  to be deleted  and delete it
        let note = await Notes.findById(req.params.id) //get old notes by id
        console.log(note);
        //allow deletion  only if user owns this note
        if (!note) { return res.status(404).send("Not Found") }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note })


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server error")
    }
})

module.exports = router