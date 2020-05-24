
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('GalleryMemes', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    imgur_id: {
      type: Sequelize.STRING,
    },
    score: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('GalleryMemes'),
};
