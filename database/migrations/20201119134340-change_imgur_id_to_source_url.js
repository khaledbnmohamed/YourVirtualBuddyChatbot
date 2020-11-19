
module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.renameColumn('Memes', 'imgur_id', 'source_url'),
  ]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.renameColumn('Memes', 'source_url', 'imgur_id'),
  ]),
};
