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
    //Fixed : Find all accepted connections — both sent and received by the logged-in user
    const data = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser, status: 'accepted' }, // requests I received and accepted
        { fromUserId: loggedInUser, status: 'accepted' }, // requests I sent and they accepted
      ],
    })
      // populate both sides — because logged-in user can be on either side of the request
      // if I am fromUserId → toUserId has the other person's details
      // if I am toUserId   → fromUserId has the other person's details
      .populate('fromUserId', 'firstName lastName')
      .populate('toUserId', 'firstName lastName');
    if (!data) {
      throw new Error('Something went wrong');
    }

    const result = data.map((connectionRequest) => {
      // logged-in user sent this request → other person is in toUserId
      if (
        connectionRequest.fromUserId._id.toString() === loggedInUser.toString()
      ) {
        return connectionRequest.toUserId;
      }

      // logged-in user received this request → other person is in fromUserId
      return connectionRequest.fromUserId;
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
