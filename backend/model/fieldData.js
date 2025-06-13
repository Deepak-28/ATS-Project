module.exports = (sequelize, Sequelize)=>{
    const FieldData = sequelize.define('FieldsData',{
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        jobId:{
            type: Sequelize.INTEGER
        },
        candidateId:{
            type: Sequelize.INTEGER
        },
        fieldId:{
            type: Sequelize.INTEGER
        },
        value:{
            type: Sequelize.TEXT
        },
        position:{
            type: Sequelize.STRING
        }
    });
    return FieldData;
}