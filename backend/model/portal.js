module.exports = (sequelize, Sequelize) => {
  const portal = sequelize.define("Portal", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
        type: Sequelize.STRING,
    },
    maskId: {
        type: Sequelize.STRING
    }
  });
  return portal;
};
