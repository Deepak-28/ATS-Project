module.exports = (sequelize, Sequelize)=>{
    const Template = sequelize.define('Template',{
        id:{
             type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name:{
            type: Sequelize.STRING
        }
    });
    return Template;
}