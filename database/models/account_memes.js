'use strict';
module.exports = (sequelize, DataTypes) => {
  const Account_Memes = sequelize.define('Account_Memes', {
    imgur_id: DataTypes.STRING,
    score: DataTypes.INTEGER
  }, {});
  Account_Memes.associate = function(models) {
  };
  return Account_Memes;
};