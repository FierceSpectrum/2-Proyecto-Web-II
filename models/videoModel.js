const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const video = new Schema({
  name: {type: String},
  url: {type: String},
});

module.exports = mongoose.model("Video", video);
