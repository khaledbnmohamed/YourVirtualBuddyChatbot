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

module.exports = function () {
  this.insert_to_sent_memes = function (SenderID, imageId, isGallery, callback) {
    try {
      if (isGallery === 'gallery') {
        models.SentMemes.create({ fb_id: SenderID, imgur_id_gallery: imageId });
        console.log('Added New record');
      } else {
        models.SentMemes.create({ fb_id: SenderID, imgur_id_account: imageId });
        console.log('Added New record');
      }
    } catch (error) {
      return ({ error: error.message });
    }
  };
  this.send_meme_to_user = function (SenderID, callback) {
    models.User.findOne({
      where: { fb_id: SenderID },
      include: [{
        model: models.SentMemes, as: 'smemes',
      }],
    })
      .then((user) => {
        if (user) {
          if (user.choosen_type === 'account') {
            models.AccountMeme.findAll({
              order: [
                ['score', 'DESC'],
              ],
              attributes: ['id', 'imgur_id', 'score'],
            }).then((memes) => {
              console.log('Memes fetched are ', memes);
            });
          } else {
            models.GalleryMeme.findAll({
              order: [
                ['score', 'DESC'],
              ],
              attributes: ['id', 'imgur_id', 'score'],
            }).then((memes) => {
              console.log('Memes fetched are 111', memes[0].imgur_id);
              console.log('Memes fetched are ', memes[1].score);

              // memes.all({
              //   include: {
              //     model: models.Sent_Memes,
              //     required: false, // do not generate INNER JOIN
              //     attributes: [], // do not return any columns of the EventFeedback table
              //   },
              //   where: sequelize.where(
              //     sequelize.col('memes.Sent_Memes'),
              //     'IS',
              //     null,
              //   ),
              // }).then((meme) => {
              //   console.log('Memes fetched are ', meme);
              // });

              this.insert_to_sent_memes(SenderID, memes[0].imgur_id, user.choosen_type);
              tools.sendImageMessage(SenderID, memes[0].imgur_id);
              tools.sendTypingOff(SenderID);
            });


            // let image_link = formingElements(body, senderID, true)
            // if (image_link) {
            // }
          }
        }
      });
  };
};
