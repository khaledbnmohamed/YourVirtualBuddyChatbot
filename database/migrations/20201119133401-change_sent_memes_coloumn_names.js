
module.exports = {
  up: (queryInterface, Sequelize) => Promise.all([
    queryInterface.renameColumn('SentMemes', 'meme_imgur_id', 'source_url'),
    queryInterface.renameColumn('SentMemes', 'meme_type', 'type'),
  ]),

  down: (queryInterface, Sequelize) => Promise.all([
    queryInterface.renameColumn('SentMemes', 'source_url', 'meme_imgur_id'),
    queryInterface.renameColumn('SentMemes', 'type', 'meme_type'),
  ]),
};
