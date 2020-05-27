
import express from 'express';
import bodyParser from 'body-parser';
import { getFirstName } from '../helpers/facebook_apis';

const cors = require('cors');
const models = require('../../database/models');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// eslint-disable-next-line import/prefer-default-export
export function getUser(senderID, callback) {
  models.sequelize.transaction((t) => models.User.findOrCreate({
    where: {
      fb_id: senderID,
    },
    defaults: {
      rec_images: 0,
      first_name: getFirstName(senderID, (err, data) => data),
    },
    transaction: t,
  })
    .then((userResult, created) => {
      if (created) {
        console.log('Created New User');
      }
      callback && callback(null, userResult[0].id, created);
    },
    (error) => {
      callback && callback(error);
    }));
}
export function addSortPrefToUser(senderID, sortByLatest, callback) {
  return models.User.findOne({ where: { fb_id: senderID } }).then((record) => {
    if (record) {
      record.update({
        sort_by_latest: sortByLatest,
      }).then(() => (true));
    } else {
      return false;
    }
  });
}
export function addSearchWord(senderID, searchQuery, callback) {
  const searchWord = searchQuery || 'memes';
  return models.User.findOne({ where: { fb_id: senderID } }).then((record) => {
    if (record) {
      record.update({
        search_word: searchWord,
      }).then(() => (true));
    } else {
      return false;
    }
  });
}
