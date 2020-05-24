
export default (sequelize, DataTypes) => {
  const GalleryMeme = sequelize.define('GalleryMeme', {
    imgur_id: DataTypes.STRING,
    score: DataTypes.INTEGER,
  }, {});
  GalleryMeme.associate = function (models) {


  };
  return GalleryMeme;
};
