
module.exports = (sequelize, DataTypes) => {
  const SyncMeta = sequelize.define('SyncMeta', {
    type: DataTypes.STRING,
    user: DataTypes.INTEGER,
    sync_date: DataTypes.DATE,
  }, {});
  SyncMeta.associate = function (models) {
    // associations can be defined here
  };
  return SyncMeta;
};
