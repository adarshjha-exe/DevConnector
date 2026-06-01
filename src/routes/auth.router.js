const express = require('express');
const bcrypt = require('bcrypt');
const { User } = require('../models/user.models');
const { validateSignup } = require('../utils/validateSignup');
const { authUser } = require('../middlewares/authUser');

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
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

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    // Password validation
    const isValidPassword = await user.verifyPassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // generate JWT token on this->who call's(user)
    const token = user.getJWT(user);

    //sending token in cookies
    res.cookie('token', token, {
      sameSite: 'strict',
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      message: 'Logged in successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: `Login failed, reason : ${error.message}`,
    });
  }
});

authRouter.post('/logout', authUser, (req, res, next) => {
  const user = req.user;

  res.clearCookie('token');
  res.status(200).send('Logout Successfully');
});

module.exports = {
  authRouter,
};
