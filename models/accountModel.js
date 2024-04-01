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
  playlists: [],
  state: {type: Boolean},
});

module.exports = mongoose.model("Account", account);
