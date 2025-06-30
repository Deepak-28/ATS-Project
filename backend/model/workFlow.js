module.exports = (sequelize, Sequelize) => {
  const workflowSchema = sequelize.define("workFlow", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workFlowName:{
      type: Sequelize.STRING
    },
    workflowType: {
      type: Sequelize.ENUM("job", "applicant"),
    }
  });
  return workflowSchema;
};
