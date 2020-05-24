'use strict';
module.exports = (sequelize, DataTypes) => {
  const AccountMemes = sequelize.define('AccountMemes', {
    imgur_id: DataTypes.STRING,
    score: DataTypes.INTEGER
  }, {});
  AccountMemes.associate = function(models) {
  };
  return AccountMemes;
};