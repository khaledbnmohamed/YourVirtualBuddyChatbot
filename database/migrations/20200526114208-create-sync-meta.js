
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('SyncDates', {
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
      type: Sequelize.STRING,
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
  }).then(() => queryInterface.addIndex('SyncDates', ['sync_date', 'type'])),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('SyncDates'),
};
