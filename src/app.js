const express = require('express');
const connectDb = require('./config/database');
const cookieParser = require('cookie-parser');
const { authRouter } = require('./routes/auth.router');
const { profileRouter } = require('./routes/profile.router');
const { requestRouter } = require('./routes/request.router');

const app = express();
app.use(express.json());
app.use(cookieParser());

// import the routers
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);









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
