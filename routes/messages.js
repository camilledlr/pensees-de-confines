var express = require('express');
var router = express.Router();
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});



app.post('/messages', (req, res) => {
  var message = new Message(req.body);
  message.save((err) =>{
    if(err)
      sendStatus(500);
    io.emit('message', req.body);
    res.sendStatus(200);
  })
})

module.exports = router;
// app.post('/messages', (req, res) => {
//   var message = new Message(req.body);
//   message.save((err) =>{
//     if(err)
//       sendStatus(500);
//     res.sendStatus(200);
//   })
// })