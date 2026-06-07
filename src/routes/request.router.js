const express = require('express');
const { authUser } = require('../middlewares/authUser');
const { ConnectionRequest } = require('../models/ConnectionRequest.models.js');

const requestRouter = express.Router();

requestRouter.post(
  '/request/send/:status/:toUserId',
  authUser,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const connection = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connection.save();
      res.status(201).json({
        success: true,
        message: 'Connection request sent successfully',
        data,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
);

module.exports = {
  requestRouter,
};
