const express = require('express');
const session = require('express-session');
const http = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const socketIO = require('socket.io');
const collection = require("./config");
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use( express.static( "public" ) );
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.set("view engine", 'ejs');
app.set('views', path.join(__dirname, '..', 'views')); // Set the views directory

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

const getUsernameFromDatabase = async () => {
  // Replace this with your actual code to retrieve the username from the database
  return "name";
};

app.get("/home", (req, res) => {
  res.render("home");
});

app.get("/test", (req, res) => {
  res.render("test");
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/index.html", (req, res) => {
  // Check if the user is logged in
  if (req.session.isLoggedIn) {
    res.render("index"); // Render the index.html page
  } else {
    res.redirect("/login"); // Redirect to login if not logged in
  }
});

app.post("/signup", async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);

  const data = {
    name: req.body.username,
    password: req.body.password,
    email: req.body.email,
    phonenumber: req.body.phonenumber,
    otp: otp
  };

  const existinguser = await collection.findOne({ phonenumber: data.phonenumber });

  if (existinguser) {
    res.send("User already exists.");
  } else {
    const salt = 10;
    const hashpassword = await bcrypt.hash(data.password, salt);

    data.password = hashpassword;
    await collection.insertMany(data);

    const mailOptions = {
      from: 'arunkumar97462@gmail.com',
      to: data.email,
      subject: 'OTP Verification',
      text: `Your OTP for verification is ${otp}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        res.send("Error sending OTP email.");
      } else {
        console.log("Email sent:", info.response);
        res.render("verify", { otp: otp, phonenumber: data.phonenumber });
      }
    });
  }
});

app.post("/verify", (req, res) => {
  const userEnteredOTP = req.body.otp;
  const savedOTP = req.body.savedOTP;

  if (userEnteredOTP === savedOTP) {
    // Set a session variable to indicate the user is logged in
    req.session.isLoggedIn = true;
    res.render("login");
  } else {
    res.send("Incorrect OTP");
  }
});
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ phonenumber: req.body.username });

    if (!check) {
      res.send("User with the given phone number not found.");
    } else {
      const isPassword = await bcrypt.compare(req.body.password, check.password);

      if (isPassword) {
        // Set a session variable to indicate the user is logged in
        req.session.isLoggedIn = true;

        // Fetch additional user information (e.g., name) from the database
        const additionalUserInfo = await collection.findOne({ phonenumber: req.body.username });
        
        if (additionalUserInfo) {
          const { name } = additionalUserInfo;
          res.render("home", { Username: name });
        } else {
          res.send("User information not found.");
        }
      } else {
        res.send("Wrong Password");
      }
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.send("Error during login.");
  }
});


io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Handle swipe-to-reply functionality
  socket.on('swipeToReply', (data) => {
    const replyMessage = data.replyMessage;
    const originalMessage = data.originalMessage;

    // Send the reply to the specific client that sent the original message
    io.to(socket.id).emit('replyToMessage', {
      originalMessage: originalMessage,
      replyMessage: replyMessage,
    });
  });

  // Handle user search requests
  socket.on('searchUsers', async (data) => {
    const searchQuery = data.query;

    try {
      const cursor = collection.find({
        $or: [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { email: { $regex: new RegExp(searchQuery, 'i') } },
        ],
      });

      const searchResults = await cursor.toArray();

      socket.emit('searchResults', searchResults);
    } catch (error) {
      console.error('Error during user search:', error);
    }
  });



});

const port = 2001;
server.listen(port, () => {
  console.log('Server running on Port:', port);
});