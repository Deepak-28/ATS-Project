module.exports = (sequelize, Sequelize) =>{
    const PostOption = sequelize.define('PostOption',{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        jobId:{
            type: Sequelize.INTEGER
        },
        jobStatus:{
            type : Sequelize.STRING
        },
        postOption:{
            type: Sequelize.STRING
        },
        postDate: {
            type: Sequelize.DATE,
        },
        expiryDate: {
            type: Sequelize.DATE
        },
    });
    return PostOption;
}