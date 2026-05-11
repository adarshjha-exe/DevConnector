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

app.listen(3000, (err) => {
  console.log('App is running');
});
