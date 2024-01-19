const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const socketIO = require('socket.io');
const collection = require("./config");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", 'ejs');
// Set the views directory (assuming server file is inside the src folder)
app.set('views', path.join(__dirname, '..', 'views'));
 // Set the views directory

// Configure session middleware
app.use(session({
  secret: '12345', // You should use a strong, random key
  resave: true,
  saveUninitialized: true
}));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'arunkumar97462@gmail.com',
    pass: 'endk xtrk xvci cuuv'
  }
});

// Routes

app.get("/", (req, res) => {
  res.render("login");
});


const port = 2002;
server.listen(port, () => {
  console.log('Server running on Port:', port);
});