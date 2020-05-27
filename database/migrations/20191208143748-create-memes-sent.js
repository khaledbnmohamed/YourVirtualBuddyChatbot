
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('SentMemes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    fb_id: {
      type: Sequelize.STRING,
    },
    meme_id: {
      type: Sequelize.INTEGER,
    },
    meme_imgur_id: {
      type: Sequelize.STRING,
    },
    meme_type: {
      type: Sequelize.STRING,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('SentMemes'),
};
