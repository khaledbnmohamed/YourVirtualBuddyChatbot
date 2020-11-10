
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Users', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    fb_id: {
      type: Sequelize.STRING,
    },
    first_name: {
      type: Sequelize.STRING,
      defaultValue: 'Buddy',

    },
    last_name: {
      type: Sequelize.STRING,
      defaultValue: 'null',
    },
    rec_images: {
      type: Sequelize.INTEGER,
    },
    sort_by_latest: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    search_word: {
      type: Sequelize.TEXT,
      defaultValue: 'memes',

    },
    choosen_type:
    {
      type: Sequelize.STRING,
      defaultValue: 'account',
    },
    want_more:
    {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
  down: (queryInterface, Sequelize) => queryInterface.dropTable('Users'),
};
