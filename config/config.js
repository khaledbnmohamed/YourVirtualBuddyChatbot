
const Sequelize = require('sequelize');
const User = require('./../database/models/user');
const GMemes = require('./../database/models/gallery_meme');
const AMemes = require('./../database/models/account_memes');


const pool = new Sequelize(process.env.DATABASE_URL);

module.exports = { pool,GMemes,AMemes,User }

