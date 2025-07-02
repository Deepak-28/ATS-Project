module.exports = (sequelize, Sequelize)=>{
    const Template = sequelize.define('Template',{
        id:{
             type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name:{
            type: Sequelize.STRING
        },
        type:{
            type: Sequelize.STRING
        },
        jobWorkFlowId:{
            type: Sequelize.INTEGER
        },
        candidateWorkFlowId:{
            type: Sequelize.INTEGER
        },
        candidateTemplateId:{
            type: Sequelize.INTEGER
        }
    });
    return Template;
}