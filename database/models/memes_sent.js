'use strict';
module.exports = (sequelize, DataTypes) => {
  const Memes_Sent = sequelize.define('Memes_Sent', {
    fb_id: DataTypes.STRING,
    imgur_id_gallery: DataTypes.STRING,
    imgur_id_account: DataTypes.STRING
  }, {});
  Memes_Sent.associate = function(models) {
    Memes_Sent.belongsTo(models.User, {
      foreignKey: 'fb_id',
      as: 'sent_to',
      onDelete: 'CASCADE',
    });  
  
  };
  return Memes_Sent;
};