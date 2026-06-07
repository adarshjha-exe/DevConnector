const express = require('express');
const { authUser } = require('../middlewares/authUser');
const { ConnectionRequest } = require('../models/ConnectionRequest.models.js');
const { User } = require('../models/user.models.js');

const requestRouter = express.Router();

requestRouter.post(
  '/request/send/:status/:toUserId',
  authUser,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // validation 1 : user must send only ignored,interested status
      const isAllowed = ['interested', 'ignored'];
      if (!isAllowed.includes(status)) {
        throw new Error('Not the valid status for the connection');
      }

      // validation 2 : Validate that the recipient user exists in the database
      const user = await User.findOne({ _id: toUserId });
      if (!user) {
        throw new Error('Recipient user does not exist');
      }

      // validation 3 : Check for duplicate connection requests between these users
      const isExistingRequest = await ConnectionRequest.findOne({
        $or: [
          { toUserId, fromUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (isExistingRequest) {
        throw new Error('Connection request is in Active state');
      }

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
