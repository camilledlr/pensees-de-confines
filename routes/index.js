var express = require('express');
var router = express.Router();
const messageModel = require("../models/Message");
var moment = require('moment');
require('moment/locale/fr');
const uploadCloud = require("../config/cloudinary");

var REFERENCE = new Date(); // fixed just for testing, use moment();
var today= moment().startOf('day');
var yesterday = moment().subtract(1, 'days').startOf('day');

function isToday(momentDate) {

    return moment(momentDate).isSame(today, 'd');
}
function isYesterday(momentDate) {
    return moment(momentDate).isSame(yesterday, 'd');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  messageModel.find()
  .then(dbRes => {
    const messages = dbRes.reduce((acc, currValue, i, array)=> {
      let date = currValue.send_date;
      let currentDate = isToday(date )? "Aujourd'hui" : isYesterday(date ) ? 'Hier' : moment(date).locale('fr').format('DD MMMM YYYY');
      const {_id, text, response, mood, file}=  currValue
      let isVideo, ext;
     if (file) ext = file.slice(file.length-3, file.length)
     if (ext === 'jpg' || ext === 'png' || ext === 'gif') isVideo = false;
     if (ext === 'mov' || ext === 'mp4') isVideo = true;
      newCurrValue = {
        _id, text, response, file, isVideo, send_date : moment(date).format('hh:mm'), mood}
      if (acc.msgArrays[acc.currentAccIndex].includes(currentDate)) {
        acc.msgArrays[acc.currentAccIndex].push((newCurrValue));
      } else {
        const newArray = [currentDate, newCurrValue];
        acc.msgArrays.push(newArray);
        acc.currentAccIndex ++
      }
      return acc}
    , {msgArrays : [[]], currentAccIndex : 0})
    messages.msgArrays.shift();
    const response = messages.msgArrays
    res.render('index', {response})})
  .catch(dbErr => console.log(dbErr))
});
router.post('/new', uploadCloud.single("file"),function(req, res, next) {
  let io = req.app.get('socketio');
  let newMsg = {};
  newMsg.text = req.body.text;
  if (req.body.mood !== '') {newMsg.mood = req.body.mood}
  if (req.file) newMsg.file = req.file.secure_url;
    messageModel.create(newMsg)
    .then(dbRes => {
      res.status(200).send('message sent')
      io.emit('chat message', dbRes)})
    .catch(dbErr => console.log(dbErr))
});

module.exports = router;
