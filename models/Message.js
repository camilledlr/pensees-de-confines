const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  text: String,
  response: {
    type : [String],
  },
  mood : {
    type : String,
    enum : ['fa-smile-beam', 'fa-grin-tongue-wink', 'fa-grin-hearts','fa-sad-cry', 'fa-angry', 'fa-flushed']
  },
  file : String,
  song : String,
  send_date: {
      type : Date,
      default : Date.now
  }
});

const messageModel= mongoose.model("Message", messageSchema );

module.exports = messageModel;
