const sequelize = require('sequelize');

const
  express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const util = require('util');
const Promise = require('bluebird');
const tools = require('../helpers/sendFunctions.js');
const models = require('../../database/models');

const app = express();
Promise.promisifyAll(FirstNewMemeToBeSentToUser);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

export function insertToSentMemes(SenderID, imageId, type, memeId, callback) {
  try {
    models.SentMeme.create({
      fb_id: SenderID, meme_imgur_id: imageId, meme_type: type, meme_id: memeId,
    })
      .then(() => console.log('Added New record'));
    return true;
  } catch (error) {
    return ({ error: error.message });
  }
}
export function sendMemeToUser(SenderID, callback) {
  models.User.findOne({
    where: { fb_id: SenderID },
  }).then((user) => {
    if (user) {
      FirstNewMemeToBeSentToUser(SenderID).then((memeTobeSent) => {
        insertToSentMemes(SenderID, memeTobeSent.imgur_id, user.choosen_type, memeTobeSent.id);
        tools.sendImageMessage(SenderID, memeTobeSent.imgur_id);
        tools.sendTypingOff(SenderID);
      });
    }
  });
}

export function FirstNewMemeToBeSentToUser(SenderID, callback) {
  return models.Meme.findAll({
    attributes: ['id', 'imgur_id'],
    where: { '$SentMemes.meme_id$': null },
    include: [{
      required: false,
      where: { '$SentMemes.fb_id$': SenderID },
      model: models.SentMeme,
      attributes: [],
    }],
  }).then((meme) => {
    return meme[0]
  });
}
