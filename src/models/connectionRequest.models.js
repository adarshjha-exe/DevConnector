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
  // "this" inside the hook = the document about to be saved. In this case it is : connection
  /**
   * const connection = new ConnectionRequest({
   *   fromUserId,
   *   toUserId,
   *   status,
   * });
   * const data = await connection.save();
   */
  // === (compares object references), .equals (ObjectId has a built-in .equals() method)
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You can't send a request to yourself");
  }
});

const ConnectionRequest = new mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema,
);

module.exports = {
  ConnectionRequest,
};
