const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 50,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      minLength: 2,
      maxLength: 50,
      required: true,
    },
    email: {
      type: String,
      unique: true,  // creates a Unique Index on email — no two users can have the same email, enforced at DB level
      trim: true,
      lowercase: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid Email Id');
        }
      },
    },
    password: {
      type: String,
    },
    age: {
      type: Number,
      min: 18,
      max: 50,
    },
    gender: {
      type: String,
      validate(value) {
        if (!['Male', 'Female', 'Others'].includes(value)) {
          throw new Error('Invalid Gender type');
        }
      },
    },
    photoUrl: {
      type: String,
      default: 'https://www.mjunction.in/wp-content/uploads/2020/09/Dummy.jpg',
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error('Not a valid Photo URL');
        }
      },
    },
    about: {
      type: String,
      default: 'This is default about',
    },
    skills: [String],
  },
  { timestamps: true },
);

// getJWT() automatically attach with all User document
userSchema.methods.getJWT = function () {
  // this points to the user instance
  const token = jwt.sign({ id: this._id }, 'MY_SECRET_KEY_DUMMY', {
    expiresIn: '7d',
  });
  return token;
};

userSchema.methods.verifyPassword = async function (password) {
  const isValidPassword = await bcrypt.compare(password, this.password);
  return isValidPassword;
};
const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
