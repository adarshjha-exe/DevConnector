const mongoose = require('mongoose');

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

const ConnectionRequest = new mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema,
);

module.exports = {
  ConnectionRequest,
};
