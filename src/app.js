const express = require('express');
const connectDb = require('./config/database');
const { User } = require('./models/user.models');
console.log(User);

const app = express();
app.use(express.json());

app.post('/signup', async (req, res) => {
  // instance of the User model
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send('User saved successfully');
  } catch (err) {
    res.status(500).send('Error in saving the user');
    console.error(err);
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
