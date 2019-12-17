const models = require('./../../database/models');
const tools = require('./../helpers/sendFunctions.js');
const sequelize = require('sequelize');

const
    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express();


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

module.exports = function () {
    this.insert_to_sent_memes = function (data, SenderID, isGallery, callback) {
        var link;
        var score;
        if (data[i].is_album == true) {

            link = data[i].images[0].link;
            score = data[i].images[0].score;
        }
        else {
            link = data[i].link;
            score = data[i].score;

        }
        try {
            if (isGallery) {
                models.Memes_Sents.create({ fb_id: Sender_ID, imgur_id_gallery: link, score: score });
                console.log("Added New record")
            }
            else {
                models.Memes_Sents.create({ fb_id: Sender_ID, imgur_id_account: link, score: score });
                console.log("Added New record")
            }

        } catch (error) {
            return ({ error: error.message })
        }
    }
    this.send_meme_to_user = function (SenderID, callback) {

        models.User.findOne({ where: { fb_id: SenderID } })
            .then(function (user) {
                if (user) {
                    if (user.choosen_type == 'account') {
                        models.Account_Meme.findAll({
                            order: [
                                ['score', 'DESC'],
                            ],
                            attributes: ['id', 'imgur_id', 'score']
                        }).then(memes => {
                            console.log("Memes fetched are ", memes)
                        })
                    }
                    else {
                        models.Gallery_Meme.findAll({
                            order: [
                                ['score', 'DESC'],
                            ],
                            attributes: ['id', 'imgur_id', 'score']
                        }).then(memes => {
                            memes.all({
                                include: {
                                    model : models.Sent_Memes,
                                    required: false, // do not generate INNER JOIN
                                    attributes: [] // do not return any columns of the EventFeedback table
                                },
                                where: sequelize.where(
                                    sequelize.col('memes.Sent_Memes'),
                                    'IS',
                                    null
                                )
                            }).then(meme => {
                                console.log("Memes fetched are ", meme)
                            });
                        });

                        // let image_link = formingElements(body, senderID, true)
                        // if (image_link) {
                        //     tools.sendTypingOff(senderID);
                        //     tools.sendImageMessage(senderID, image_link);
                        // }
                    }
                }
            })
    }
}



