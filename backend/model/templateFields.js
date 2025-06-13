module.exports = (sequelize, Sequelize)=>{
    const TemplateFields = sequelize.define('TemplateFields',{
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        templateId:{
            type: Sequelize.INTEGER
        },
        fieldId:{
            type: Sequelize.INTEGER
        },
        position:{
           type: Sequelize.ENUM('left', 'right'),
           allowNull: false,
        },
        order:{
            type: Sequelize.INTEGER
        }
    });
    return TemplateFields;
}