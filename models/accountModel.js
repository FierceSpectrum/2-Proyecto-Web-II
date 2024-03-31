const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const account = new Schema({
  full_name: {type: String},
  pin: {type: Number},
  avatar: {type: String},
  age: {type: Number},
  user: {
    type: mongoose.ObjectId,
    ref: "User",
  },
  // playlist: {
  //   type: mongoose.ObjectId,
  //   ref: "Playlist",
  // },
  state: {type: Boolean},
});

module.exports = mongoose.model("Account", account);
