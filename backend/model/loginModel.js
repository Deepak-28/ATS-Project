module.exports = (sequelize, Sequelize) => {
  const loginSchema = sequelize.define("Login", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    role: {
      type: Sequelize.STRING,
    },
    cid: {
      type: Sequelize.STRING,
    },
    candidateId: {
      type: Sequelize.INTEGER,
    },
    resetOtp: {
      type: Sequelize.STRING,
    },
    otpExpiry: {
      type: Sequelize.DATE,
    },
  });
  return loginSchema;
};
