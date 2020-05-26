
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('SyncMetas', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    type: {
      type: Sequelize.STRING,
    },
    user: {
      type: Sequelize.INTEGER,
    },
    sync_date: {
      type: Sequelize.DATE,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }).then(() => queryInterface.addIndex('SyncMetas', ['sync_date', 'type'])),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('SyncMetas'),
};
