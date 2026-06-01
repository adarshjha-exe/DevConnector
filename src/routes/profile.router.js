const express = require('express');
const { authUser } = require('../middlewares/authUser');
const validateProfileUpdate = require('../middlewares/validateProfileUpdate');
const bcrypt = require('bcrypt');

const profileRouter = express.Router();

profileRouter.get('/profile/view', authUser, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({
      message: `Profile fetch failed, reason : ${error.message}`,
    });
  }
});

profileRouter.patch('/profile/update', authUser, async (req, res) => {
  try {
    // validate fields
    const isAllowed = validateProfileUpdate(req);
    if (!isAllowed) {
      throw new Error("Mentioned field can't be edited");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => {
      loggedInUser[key] = req.body[key];
    });
    await loggedInUser.save();
    res.status(200).json({
      status: 'success',
      loggedInUser,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      'error Message': error.message,
    });
  }
});

profileRouter.patch('/profile/changepassword', authUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'Current password and new password are required',
      });
    }
    const user = req.user;

    // verify existing password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      return res.status(401).json({
        status: false,
        message: 'Incorrect password',
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({
      status: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
});

module.exports = {
  profileRouter,
};
