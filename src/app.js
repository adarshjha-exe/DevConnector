const express = require('express');
const connectDb = require('./config/database');
const { User } = require('./models/user.models');
const { validateSignup } = require('./utils/validateSignup');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { authUser } = require('./middlewares/authUser');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/signup', async (req, res) => {
  // Allowed field
  const ALLOWED_FIELDS = [
    'firstName',
    'lastName',
    'email',
    'password',
    'age',
    'gender',
    'photoUrl',
    'about',
    'skills',
  ];
  try {
    const isAllowed = Object.keys(req.body).every((key) => {
      return ALLOWED_FIELDS.includes(key);
    });

    if (!isAllowed) {
      throw new Error('Invalid field in the request');
    }
    // validator
    validateSignup(req.body);

    // destructor the required fields
    const {
      firstName,
      lastName,
      email,
      password,
      age,
      gender,
      photoUrl,
      about,
      skills,
    } = req.body;

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // instance of the User model
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      gender,
      photoUrl,
      about,
      skills,
    });
    await user.save();
    res.status(201).send('User saved successfully');
  } catch (err) {
    res.status(500).send(`Error in saving the user : ${err.message}`);
    console.error(err.message);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    // Password validation
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // generate JWT token
    const token = jwt.sign({ id: user._id }, 'MY_SECRET_KEY_DUMMY');
    //sending token in cookies
    res.cookie('token', token);

    res.status(200).json({
      message: 'Logged in successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: `Login failed, reason : ${error.message}`,
    });
  }
});

app.get('/profile', authUser, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({
      message: `Profile fetch failed, reason : ${error.message}`,
    });
  }
});



connectDb()
  .then(() => {
    console.log('Database is connected !!');
    app.listen(3000, (err) => {
      if (err) {
        console.log(err.message);
      }
      console.log('Server is up and running');
    });
  })
  .catch((err) => {
    console.log('Database connection failed !');
  });
