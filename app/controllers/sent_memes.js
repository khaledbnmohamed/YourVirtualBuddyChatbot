const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Promise = require('bluebird');
const tools = require('../helpers/send_functions.js');
const models = require('../../database/models');

const app = express();
// eslint-disable-next-line no-use-before-define
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
export function FirstNewMemeToBeSentToUser(SenderID, type, callback) {
  return models.Meme.findAll({
    attributes: ['id', 'imgur_id'],
    where: { '$SentMemes.meme_id$': null, type },
    include: [{
      required: false,
      where: { '$SentMemes.fb_id$': SenderID },
      model: models.SentMeme,
      attributes: [],
    }],
  // eslint-disable-next-line arrow-body-style
  }).then((meme) => {
    return meme[0];
  });
}
export function sendMemeToUser(SenderID, callback) {
  models.User.findOne({
    where: { fb_id: SenderID },
  }).then((user) => {
    if (user) {
      FirstNewMemeToBeSentToUser(SenderID, user.choosen_type).then((memeTobeSent) => {
        insertToSentMemes(SenderID, memeTobeSent.imgur_id, memeTobeSent.type, memeTobeSent.id);
        tools.sendImageMessage(SenderID, memeTobeSent.imgur_id);
        tools.sendTypingOff(SenderID);
      });
    }
  });
}
