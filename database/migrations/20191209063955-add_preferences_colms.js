'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'Users',
        'choosen_type',
        {
          type: Sequelize.STRING,
          defaultValue: 'account'

        }
      ),

    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Users', 'choosen_type'),
    ]);
  }
};