var express = require('express');
var router = express.Router();
const messageModel = require("../models/Message");


/* GET home page. */
router.get('/', function(req, res, next) {
  messageModel.find()
  .then(messages => {
    res.render('index', {messages})})
  .catch(dbErr => console.log(dbErr))
});

// app.get('/messages', (req, res) => {
//   Message.find({},(err, messages)=> {
//     res.send(messages);
//   })
// })
module.exports = router;
