
module.exports = (sequelize, DataTypes) => {
  const SentMemes = sequelize.define('SentMemes', {
    fb_id: DataTypes.STRING,
    imgur_id_gallery: DataTypes.STRING,
    imgur_id_account: DataTypes.STRING,
  }, {});
  SentMemes.associate = function (models) {
    SentMemes.belongsTo(models.User, {
      foreignKey: 'fb_id',
      as: 'sent_to',
      onDelete: 'CASCADE',
    });
  };
  return SentMemes;
};
