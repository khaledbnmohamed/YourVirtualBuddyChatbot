
module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.addColumn(
      'Memes',
      'source',
      {
        type: Sequelize.STRING,
        defaultValue: 'imgur',
      },

    )]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.removeColumn(
      'Memes',
      'source',
      {
        type: Sequelize.STRING,
        defaultValue: 'imgur',
      },

    )]),
};
