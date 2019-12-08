'use strict';
module.exports = (sequelize, DataTypes) => {
  const Gallery_Meme = sequelize.define('Gallery_Meme', {
    imgur_id: DataTypes.STRING,
    score: DataTypes.INTEGER
  }, {});
  Gallery_Meme.associate = function(models) {

  
  };
  return Gallery_Meme;
};