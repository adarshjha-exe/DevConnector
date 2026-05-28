const mongoose = require('mongoose');

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
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
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
    },
    about: {
      type: String,
      default: 'This is default about',
    },
    skills: [String],
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};
