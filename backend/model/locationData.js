module.exports = (sequelize, Sequelize) =>{
    const locationData = sequelize.define('locationData',{
        id:{
            type:Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        fieldId:{
            type:Sequelize.INTEGER
        },
        fieldDataId:{
            type:Sequelize.INTEGER
        },
        jobId:{
            type:Sequelize.INTEGER
        },
        candidateId:{
            type:Sequelize.INTEGER
        },
        countryCode:{
            type:Sequelize.STRING
        },
        countryName:{
            type:Sequelize.STRING,
        },
        stateCode:{
            type:Sequelize.STRING
        },
        stateName:{
            type:Sequelize.STRING,
        },
        cityName:{
            type: Sequelize.STRING
        },
    });
    return locationData;
}