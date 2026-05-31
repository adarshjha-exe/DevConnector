const express = require('express');
const { authUser } = require('../middlewares/authUser');


const requestRouter = express.Router();

requestRouter.post('/sendConnection', authUser, (req, res) => {
  res.status(200).send(`Connection request sent by ${req.user.firstName}`);
});

module.exports = {
  requestRouter,
};
