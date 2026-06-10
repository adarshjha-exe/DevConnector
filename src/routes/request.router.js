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

requestRouter.patch(
  '/request/:requestId/review',
  authUser,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status } = req.body;

      // only accepted and rejected can be allowed status
      const ALLOWED_STATUS = ['rejected', 'accepted'];
      if (!ALLOWED_STATUS.includes(status)) {
        throw new Error('Not the valid status');
      }
      const data = await ConnectionRequest.findOne({
        status: 'interested',
        _id: requestId, // this id must be present in DB
        toUserId: req.user.id, // only the user whom the request have been sent, can accept it not any other authentication user can't
      });
      if (!data) {
        throw new Error('Not the valid request');
      }
      // new status update
      data.status = status;

      await data.save();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      res.json({
        success: false,
        message: error.message,
      });
    }
  },
);

requestRouter.get('/users/requests', authUser, async (req, res) => {
  try {
    const data = await ConnectionRequest.find({
      toUserId: req.user._id,
      status: 'interested',
    }).populate('fromUserId', 'firstName lastName photoUrl about ');
    if (!data) {
      throw new Error('Request not found');
    }
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

requestRouter.get('/users/allConnection', authUser, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    //BUGGY CODE : Find all accepted requests where someone sent me a request and I accepted it | BUG : what if i sent the friend request to virat and virat accepted it ? in that case it will not show those connections.
    const data = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser, status: 'accepted' },
        { fromUserId: loggedInUser, status: 'accepted' },
      ],
    }).populate('fromUserId', 'firstName lastName');
    if (!data) {
      throw new Error('Something went wrong');
    }

    const result = data.map((user) => {
      return user.fromUserId;
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = {
  requestRouter,
};
