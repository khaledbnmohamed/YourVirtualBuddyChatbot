
module.exports = (sequelize, DataTypes) => {
  const SentMeme = sequelize.define('SentMeme', {
    fb_id: DataTypes.STRING,
    meme_id: DataTypes.INTEGER,
    meme_imgur_id: DataTypes.STRING,
    meme_type: DataTypes.STRING,
  }, {});
  SentMeme.associate = function (models) {
    SentMeme.belongsTo(models.User, {
      foreignKey: 'fb_id',
      as: 'sent_to',
      onDelete: 'CASCADE',
    });
    SentMeme.belongsTo(models.Meme, { foreignKey: 'meme_id' });
  };

  return SentMeme;
};
