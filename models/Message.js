const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: String,
  response: {
    type : [String],
  },
  send_date: {
      type : Date,
      default : Date.now
  }
});

const messageModel= mongoose.model("Message", messageSchema );

module.exports = messageModel;
