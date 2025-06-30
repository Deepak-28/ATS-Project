module.exports = (sequelize, Sequelize) => {
  const workflowStageSchema = sequelize.define("workFlowStage", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workFlowId:{
      type: Sequelize.INTEGER
    },
    StageName: {
      type: Sequelize.STRING
    },
    Order:{
        type: Sequelize.INTEGER
    }
  });
  return workflowStageSchema;
};