
import express from 'express';
import bodyParser from 'body-parser';
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
    defaults: { rec_images: 0 },
    transaction: t,
  })
    .then((userResult, created) => {
      if (created) {
        Console.log('Created New User');
      }
      callback && callback(null, userResult[0].id, created);
    },
    (error) => {
      callback && callback(error);
    }));
}
