
export default (sequelize, DataTypes) => {
  // Type 0 for account memes
  // Type 1 for gallery memes

  const Meme = sequelize.define('Meme', {
    imgur_id: DataTypes.STRING,
    score: DataTypes.INTEGER,
    type: DataTypes.STRING,
  }, {});
  Meme.associate = function (models) {


  };
  return Meme;
};
