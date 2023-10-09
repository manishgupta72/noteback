const connectMongo = require('./db')
const dotenv=require('dotenv')
const express = require('express')
connectMongo();

const app = express();
const PORT = process.env.PORT;

dotenv.config({path:'./config.env'})
//The express. json() function is a middleware function used in Express.
// js applications to parse incoming JSON data from HTTP requests,
// a standard format for data transmission in web servers.
app.use(express.json())

//Available routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))


app.listen(PORT, () => {
    console.log(`iNotebook backend  started at port ${PORT}`)
})