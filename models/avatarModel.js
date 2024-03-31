const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const avatar = new Schema({
  url: {type: String},
});

module.exports = mongoose.model("Avatar", avatar);
