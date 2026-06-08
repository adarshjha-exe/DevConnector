const mongoose = require('mongoose');
const { User } = require('./user.models');

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['accepted', 'ignored', 'rejected', 'interested'],
        message: `{VALUE} is not the valid status`,
      },
    },
  },
  {
    timestamps: true,
  },
);

// pre hook : to check toUser != fromUser
connectionRequestSchema.pre('save', async function () {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You can't send a request to yourself");
  }
});

// compound index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// index
connectionRequestSchema.index({ toUserId: 1 });

const ConnectionRequest = new mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema,
);

module.exports = {
  ConnectionRequest,
};
