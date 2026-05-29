const express = require('express');
const connectDb = require('./config/database');
const { User } = require('./models/user.models');

const app = express();
app.use(express.json());

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

    // instance of the User model
    const user = new User(req.body);
    await user.save();
    res.status(201).send('User saved successfully');
  } catch (err) {
    res.status(500).send(`Error in saving the user : ${err.message}`);
    console.error(err.message);
  }
});

// GET -/feed (get all user)
app.get('/feed', async (req, res) => {
  try {
    const users = await User.find();
    if (users) {
      res.status(200).send(users);
    } else {
      res.status(404).json({
        status: 'Failed',
        reason: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'something went wrong',
    });
  }
});

// GET /user by firstName
app.get('/user', async (req, res) => {
  const name = req.body.name;
  console.log(name);
  try {
    const user = await User.findOne({ firstName: name });
    console.log(user);
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).json({
        status: 'Failed',
        reason: 'User not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'something went wrong',
    });
  }
});

app.delete('/user', async (req, res) => {
  try {
    const userId = req.body.id;
    await User.findByIdAndDelete(userId);
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(500).json({
      message: 'something went wrong',
    });
  }
});

app.patch('/user/:id', async (req, res) => {
  try {
    const data = req.body;
    const userId = req.params.id;
    const ALLOWED_UPDATE = [
      'firstName',
      'lastName',
      'password',
      'age',
      'gender',
      'skills',
    ];
    const isAllowed = Object.keys(data).every((field) => {
      return ALLOWED_UPDATE.includes(field);
    });

    if (!isAllowed) {
      throw new Error('Not allowed to updated this field');
    }
    if (data?.skills?.length > 10) {
      throw new Error('Not allowed to add more than 10 skills');
    }

    await User.findByIdAndUpdate(userId, req.body, { runValidators: true });
    res.status(200).send({
      message: 'User updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
