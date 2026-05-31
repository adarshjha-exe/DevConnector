const express = require('express');
const { authUser } = require('../middlewares/authUser');

const profileRouter = express.Router();

profileRouter.get('/profile', authUser, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({
      message: `Profile fetch failed, reason : ${error.message}`,
    });
  }
});

module.exports = {
  profileRouter,
};
