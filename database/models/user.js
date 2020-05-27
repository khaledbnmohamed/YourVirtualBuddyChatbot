
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fb_id: DataTypes.STRING,
    first_name: DataTypes.STRING,
    rec_images: DataTypes.INTEGER,
    search_word: DataTypes.TEXT,
    sort_by_latest: DataTypes.BOOLEAN,
    choosen_type: DataTypes.TEXT,
  }, {});
  User.associate = function (models) {
    User.hasMany(models.SentMeme, {
      foreignKey: 'id',
      as: 'smemes',
      onDelete: 'CASCADE',
    });
  };
  return User;
};
