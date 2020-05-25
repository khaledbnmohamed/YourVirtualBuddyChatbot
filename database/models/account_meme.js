'use strict';
module.exports = (sequelize, DataTypes) => {
  const AccountMeme = sequelize.define('AccountMeme', {
    imgur_id: DataTypes.STRING,
    score: DataTypes.INTEGER
  }, {});
  AccountMeme.associate = function(models) {
  };
  return AccountMeme;
};