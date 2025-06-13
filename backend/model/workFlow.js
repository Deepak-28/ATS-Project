module.exports = (sequelize, Sequelize) => {
  const workflowSchema = sequelize.define("workFlow", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workflowType: {
      type: Sequelize.ENUM("job", "applicant"),
    },
    stageName: {
      type: Sequelize.STRING,
    },
    order: {
      type: Sequelize.INTEGER,
    },
    // jobId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "job", // Name of the job table
    //     key: "id",
    //   },
    // },
    // applicantId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: "applicants", // Name of the applicant table
    //     key: "id",
    //   },
    // },
  });
  return workflowSchema;
};
