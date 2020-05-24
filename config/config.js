
import Sequelize from 'sequelize';
import User from '../database/models/user';
import GMemes from '../database/models/gallery_meme';
import AMemes from '../database/models/account_memes';


const pool = new Sequelize(process.env.DATABASE_URL);

export default {
  pool, GMemes, AMemes, User,
};
