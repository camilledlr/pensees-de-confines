var express = require('express');
var router = express.Router();
const messageModel = require("../models/Message");
var moment = require('moment');
require('moment/locale/fr');
const uploadCloud = require("../config/cloudinary");
const axios = require('axios')
var request = require('request'); // "Request" library

var client_id = process.env.CLIENT_ID;
var client_secret = process.env.CLIENT_SECRET;

// your application requests authorization
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};


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
    dbRes.sort(function(a,b){
      return new Date(b.send_date) - new Date(a.send_date)})
    const messages = dbRes.reduce((acc, currValue, i, array)=> {
      let date = currValue.send_date;
      let currentDate = isToday(date )? "Aujourd'hui" : isYesterday(date ) ? 'Hier' : moment(date).locale('fr').format('DD MMMM YYYY');
      const {_id, text, response, mood, file, song}=  currValue
      let isVideo, ext;
     if (file) ext = file.slice(file.length-3, file.length)
     if (ext === 'jpg' || ext === 'png' || ext === 'gif') isVideo = false;
     if (ext === 'mov' || ext === 'mp4') isVideo = true;
      newCurrValue = {
        _id, text, response, file, isVideo, send_date : moment(date).format('hh:mm').locale('fr'), mood, song}
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
  if (req.body.song) {newMsg.song = req.body.song}
  if (req.file) newMsg.file = req.file.secure_url;
    messageModel.create(newMsg)
    .then(dbRes => {
      res.status(200).send('message sent')
      io.emit('chat message', dbRes)})
    .catch(dbErr => console.log(dbErr))
});
router.get('/search', function(req, res, next) {
  let input = req.query.q
  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var token = body.access_token;
      var options = {
        url: `https://api.spotify.com/v1/search?q=${input}&type=track`,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
      };
      request.get(options, function(error, response, body) {
        const toSend = body.tracks.items.sort((a,b)=> b.popularity - a.popularity)
        res.status(200).json(toSend)
      });
    }
  });
})


module.exports = router;
