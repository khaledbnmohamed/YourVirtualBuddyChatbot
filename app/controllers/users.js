
import express from 'express';
import bodyParser from 'body-parser';
import { getFirstName } from '../helpers/facebook_apis';

const cors = require('cors');
const models = require('../../database/models');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

export function insertUser(senderID, callback) {
  getFirstName(senderID, (err, firstName) => {
    if (err) console.error(err);
    try {
      models.User.create({
        fb_id: senderID,
        rec_images: 0,
        first_name: firstName,
      })
        .then((user) => callback && callback(null, user));
    } catch (error) {
      callback && callback(error, null);
    }
  });
}

// eslint-disable-next-line import/prefer-default-export
export function getUser(senderID, callback) {
  models.User.findOne({ where: { fb_id: senderID } })
    .then((userResult) => {
      if (userResult) {
        callback(userResult);
      } else {
        insertUser(senderID, (user) => { callback && callback(user); });
      }
    });
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
export function changeChoosenType(senderID, choosen_type, callback) {
  return models.User.findOne({ where: { fb_id: senderID } }).then((record) => {
    if (record) {
      record.update({
        choosen_type,
      }).then(() => (callback()));
    } else {
      return false;
    }
  });
}