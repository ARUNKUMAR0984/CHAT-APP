const mongoose = require('mongoose');
const { type } = require('os');
const connect = mongoose.connect("mongodb+srv://arunkumar97462:Arun4785997@cluster0.3vins1f.mongodb.net/LOGIN")

connect.then(() => {
    console.log("Database is connected succesfully");
})
.catch(() => {
    console.log("Database not connected");
});

const LoginSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    password: {
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true

    },
    phonenumber:{
        type:Number,
        required:true
    },

    otp: {
        type: Number // Add this field for storing OTP
    },

    socketId: String
});

const collection = new mongoose.model("users", LoginSchema);

module.exports = collection;
 