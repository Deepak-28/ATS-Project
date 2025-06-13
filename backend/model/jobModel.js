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
        jobTitle: {
            type: Sequelize.STRING,
        },
        jobDescription: {
            type: Sequelize.STRING,
        },
        jobExperience: {
            type: Sequelize.STRING,
        },
        jobLocation: {                        
            type: Sequelize.STRING,
        },
        jobType: {
            type: Sequelize.STRING,
        },
        skills: {
            type: Sequelize.STRING,
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