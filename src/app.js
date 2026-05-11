const express = require('express');

const app = express();

const { adminAuth, userAuth } = require('./middlewares/auth.middleware');
app.use('/admin', adminAuth);

app.get('/user/profile', userAuth, (req, res) => {
  res.send('All user fetched');
});

app.get('/admin/getAllUsers', (req, res) => {
  res.send('All user fetched');
});

//error handling
app.get('/user', (req, res) => {
  // try {
  //logic for finding the user
  throw new Error('Random error');
  // } catch (error) {
  //   console.log(error.message);
  //   res.status(401).send('Error occurred');
  // }
});

//error handler : Always in the last for uncaught err
app.use('/', (err, req, res, next) => {
  if (err) {
    res.send('Something Broke');
  }
});

app.listen(3000, (err) => {
  console.log('App is running');
});
