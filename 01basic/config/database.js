const mongoose = require('mongoose');

const MONGODB_URL = "something"

exports.connect = () => {
    mongoose.connect(MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(console.log("Database Connected"))
    .catch((error) => {
        console.log("Database Connection failed");
        console.log(error);
        process.exit(1)
    })
}