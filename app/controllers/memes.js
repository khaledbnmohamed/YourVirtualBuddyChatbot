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
    this.insert_to_gallery = function (data, callback) {
        var daily_number = 50
        var link;
        var score;
        for (var i = 0; i < daily_number; i++) {
            if (data[i].is_album == true) {

                link = data[i].images[0].link;
                score = data[i].images[0].score;
            }
            else {
                link = data[i].link;
                score = data[i].score;

            }
            try {
                 models.Gallery_Meme.create({ imgur_id: link, score: score });
                console.log("Added New record")
            } catch (error) {
                return ({ error: error.message })
            }
        }
        // pool.query('INSERT INTO gallery_memes (imgur_id,score,created_at) VALUES ($1, $2, $3) RETURNING id', [link,score, new Date()], (error) => {
        //     if (error) throw (error)
        // })
    }
}


  
