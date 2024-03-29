import { insertToSyncDate } from './sync_dates';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('../../database/models');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// eslint-disable-next-line import/prefer-default-export
export function bulkInsertToGallery(
  data,
  type,
  senderID,
  SearchQuery,
  callback,
) {
  const dailyNumber = 20;
  let link;
  let score;
  // Need to handle out of array errors
  if (data.length < 1) {
    return true;
  }
  for (let i = 0; i <= dailyNumber; i += 1) {
    if (data[i].is_album === true) {
      link = data[i].images[0].link;
      score = data[i].images[0].score;
    } else {
      link = data[i].link;
      score = data[i].score;
    }
    if (!score) score = 0;
    try {
      models.Meme.findOrCreate({ where: { imgur_id: link, score, type } }).then(
        () => {
          if (i === dailyNumber) {
            insertToSyncDate(senderID, type, SearchQuery);
            callback();
          }
          console.log('Added New record');
        },
      );
    } catch (error) {
      throw error.message;
    }
  }
  return true;
  // pool.query('INSERT INTO GalleryMemes (imgur_id,score,created_at) VALUES ($1, $2, $3) RETURNING id', [link,score, new Date()], (error) => {
  //     if (error) throw (error)
  // })
}
export function insertToAccount(data, callback) {
  const dailyNumber = 50;
  let link;
  let score;
  for (let i = 0; i < dailyNumber; i += 1) {
    if (data[i].is_album === true) {
      link = data[i].images[0].link;
      score = data[i].images[0].score;
    } else {
      link = data[i].link;
      score = data[i].score;
    }
    try {
      debugger;
      models.AccountMemes.create({ imgur_id: link, score });
      console.log('Added New record');
    } catch (error) {
      throw error.message;
    }
  }
  return true;
  // pool.query('INSERT INTO GalleryMemes (imgur_id,score,created_at) VALUES ($1, $2, $3) RETURNING id', [link,score, new Date()], (error) => {
  //     if (error) throw (error)
  // })
}
