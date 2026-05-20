const mongoose = require('mongoose');

async function connectDb() {
  mongoose.connect(
    'mongodb+srv://cbh_node:Ct9mAZNQC67nrQM11111dew@node-adarsh.5mu5nqt.mongodb.net/devTinder',
  );
}

module.exports = connectDb;
