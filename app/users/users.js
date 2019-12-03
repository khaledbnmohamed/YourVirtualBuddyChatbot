const
    express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    { pool } = require('./../../config/config'),
    app = express();


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

module.exports = function () {

    this.get_user = function (senderID, callback) {
        pool.query("SELECT * FROM users WHERE fb_id = $1", [senderID], (error, results) => {
            if (results.rowCount == 0) {
                pool.query('INSERT INTO users (fb_id,created_at) VALUES ($1, $2) RETURNING id', [senderID, new Date()], (error, result) => {
                    if (error) throw (error)
                    callback("", result.rows[0])
                })
            }
            else {
                callback("", results.rows[0].id)
            }
        })
    }

    this.get_user = function (senderID, callback) {
        pool.query("SELECT * FROM users WHERE fb_id = $1", [senderID], (error, results) => {
            if (results.rowCount == 0) {
                pool.query('INSERT INTO users (fb_id,created_at) VALUES ($1, $2) RETURNING id', [senderID, new Date()], (error, result) => {
                    if (error) throw (error)
                    callback("", result.rows[0])
                })
            }
            else {
                callback("", results.rows[0].id)
            }
        })
    }

}