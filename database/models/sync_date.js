
module.exports = (sequelize, DataTypes) => {
  const SyncDate = sequelize.define('SyncDate', {
    type: DataTypes.STRING,
    user: DataTypes.STRING,
    sync_date: DataTypes.DATE,
  }, {
  });
  SyncDate.associate = function (models) {
    // associations can be defined here
  };
  return SyncDate;
};
