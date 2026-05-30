const jwt = require('jsonwebtoken');
const { User } = require('../models/user.models');

const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error('Token is not valid!');
    }
    const dataObj = jwt.verify(token, 'MY_SECRET_KEY_DUMMY');
    const userId = dataObj.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User is not present in DB!!!');
    }
    req.user = user;
    next();
  } catch (error) {
    res.send(`Error in Auth Middleware ${error.message}`);
  }
};

module.exports = {
  authUser,
};
