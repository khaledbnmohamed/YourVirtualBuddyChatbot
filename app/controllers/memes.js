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
export async function bulkInsertToGallery(
  ImagesArray,
  type,
  senderID,
  SearchQuery,
  callback,
) {
  ImagesArray.forEach((item) => {
    try {
      models.Meme.findOrCreate({
        where: {
          source_url: item.source_url,
          score: item.score || 0,
          type,
        },
      }).spread((user, created) => {
        if (created) console.log('Added New record');
      });
    } catch (error) {
      throw error.message;
    }
  });
  insertToSyncDate(senderID, type, SearchQuery);
  callback();
  return true;
}
