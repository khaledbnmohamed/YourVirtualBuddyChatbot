const sequelize = require('sequelize');

const
  express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const tools = require('../helpers/sendFunctions.js');
const models = require('../../database/models');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

export function insertToSentMemes(SenderID, imageId, type, callback) {
  try {
    models.SentMeme.create({ fb_id: SenderID, imgur_id: imageId, meme_type: type })
      .then(() => console.log('Added New record'));
    return true;
  } catch (error) {
    return ({ error: error.message });
  }
}
export function sendMemeToUser(SenderID, callback) {
  console.log('##########################################');
  models.User.findOne({
    where: { fb_id: SenderID },
  }).then((user) => {
    if (user) {
      console.log(user.fb_id);

      models.Meme.findAll({
        where: { type: user.choosen_type },

        order: [
          ['score', 'DESC'],
        ],
        attributes: ['id', 'imgur_id', 'score'],
      }).then((memes) => {
        console.log('Memes fetched are ', memes);
        console.log('Memes fetched are 111', memes[0].imgur_id);
        console.log('Memes fetched are ', memes[1].score);
        insertToSentMemes(SenderID, memes[0].imgur_id, user.choosen_type);
        tools.sendImageMessage(SenderID, memes[0].imgur_id);
        tools.sendTypingOff(SenderID);
      });

      console.log('##########################################');

      // let image_link = formingElements(body, senderID, true)
      // if (image_link) {
      // }
    }
  });
}

export function FirstNewMemeToBeSentToUser() {
  models.GalleryMeme.all({
    include: {
      model: models.Sent_Memes,
      required: false, // do not generate INNER JOIN
      attributes: [], // do not return any columns of the EventFeedback table
    },
    where: sequelize.where(
      sequelize.col('memes.Sent_Memes'),
      'IS',
      null,
    ),
  }).then((meme) => {
    console.log('Memes fetched are ', meme);
  });
}
