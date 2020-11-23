import Sequelize from 'sequelize';
import { updateRecievedCounter } from './users';
import { AppError } from '../errors/error_handler';
import { exceededDailyMemes } from '../../config/constant_messages';

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
      fb_id: SenderID, source_url: imageId, type, meme_id: memeId,
    })
      .then(() => updateRecievedCounter(SenderID));
    return true;
  } catch (error) {
    return ({ error: error.message });
  }
}
export function FirstNewMemeToBeSentToUser(SenderID, type, callback) {
  return models.Meme.findAll({
    attributes: ['id', 'source_url', 'type'],
    where: { '$SentMemes.meme_id$': null, type },
    // order: [['score', 'DESC']],
    order: [[Sequelize.fn('RANDOM')]],
    include: [{
      required: false,
      where: { '$SentMemes.fb_id$': SenderID },
      model: models.SentMeme,
      attributes: [],
    }],
  // eslint-disable-next-line arrow-body-style
  }).then((meme) => {
    if (!meme[0]) { throw new AppError('InvalidInput', 'exceeded limit of day ', true, exceededDailyMemes, SenderID); }
    return meme[0];
  });
}
export function sendMemeToUser(SenderID, callback) {
  models.User.findOne({
    where: { fb_id: SenderID },
  }).then((user) => {
    if (user) {
      FirstNewMemeToBeSentToUser(SenderID, user.choosen_type).then((memeTobeSent) => {
        insertToSentMemes(SenderID, memeTobeSent.source_url, memeTobeSent.type, memeTobeSent.id);
        tools.sendImageMessage(SenderID, memeTobeSent.source_url);
        tools.sendTypingOff(SenderID);
      });
    }
  });
}
