const workFlow = require("./workFlow");

module.exports = (sequelize, Sequelize) => {
    const Job = sequelize.define('Jobs', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        companyName: {
            type: Sequelize.STRING,
        },
        companyId:{
            type:Sequelize.INTEGER
        },
        templateId:{
            type: Sequelize.INTEGER
        },
        workFlowId:{
            type: Sequelize.INTEGER
        },
        status: {
            type: Sequelize.TEXT,
        },
        postDate: {
            type: Sequelize.DATE,
        },
        expiryDate: {
            type: Sequelize.DATE
        },
        visibility: {
            type: Sequelize.STRING
        }
    });
    // Job.hasMany(Workflow, { foreignKey: 'jobId' }); 
    return Job;
}