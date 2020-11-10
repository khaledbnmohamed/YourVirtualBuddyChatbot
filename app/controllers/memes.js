
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const models = require('../../database/models');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

export function insertToGallery(data, callback) {
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
    if (!score) score = 0;
    try {
      models.GalleryMeme.create({ imgur_id: link, score });
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
