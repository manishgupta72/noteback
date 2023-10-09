// getting-started.js
const mongoose = require('mongoose');

// const uri = 'mongodb://localhost:27017/inotebook';

function connectMongo() {
    //takes connection string and connect to the mongodb compass
    uri="mongodb+srv://manish07:manish@cluster0.n9huzd5.mongodb.net/inotebook?retryWrites=true&w=majority"
    mongoose.connect(uri)
    .then(()=>{console.log("iNotebook connected")})
    .catch((error)=>{console.log(error);})

  
}
module.exports = connectMongo;