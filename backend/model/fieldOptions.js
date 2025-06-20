module.exports = (sequelize, Sequelize) =>{
    const fieldOption = sequelize.define('fieldOptions',{
        id:{
            type:Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        fieldId:{
            type:Sequelize.INTEGER
        },
        optionCode:{
            type:Sequelize.STRING
        },
        value:{
            type:Sequelize.STRING,
        },
        order:{
            type:Sequelize.INTEGER
        },
        status:{
            type:Sequelize.STRING
        }
    });
    return fieldOption;
}