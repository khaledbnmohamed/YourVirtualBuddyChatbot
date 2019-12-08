const models = require('./../../database/models');

const
    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    app = express();


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

module.exports = function () {

    this.get_user = function (senderID, callback) {
        models.sequelize.transaction(function (t) {
            return models.User.findOrCreate({
                where: {
                    fb_id: senderID
                },
                defaults: { rec_images: 0 },
                transaction: t
            })
                .then(function (userResult, created) {
                    callback && callback(null, userResult[0].id, created);
                    
                },
                    function (error) {
                        callback && callback(error);
                    });
        });
    }
}