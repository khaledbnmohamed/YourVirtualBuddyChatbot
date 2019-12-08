'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fb_id: DataTypes.STRING,
    rec_images: DataTypes.INTEGER,
    search_word: DataTypes.TEXT
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Memes_Sent, {
      foreignKey: 'id',
      as: 'smemes',
      onDelete: 'CASCADE',
    });


    };
  return User;
};