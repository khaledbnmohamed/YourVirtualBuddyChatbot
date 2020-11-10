
import Sequelize from 'sequelize';
import User from '../database/models/user';
import Meme from '../database/models/meme';


const pool = new Sequelize(process.env.DATABASE_URL);

export default {
  pool, Meme, User,
};
