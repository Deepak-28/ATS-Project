module.exports = (sequelize, Sequelize) =>{
    const companySchema = sequelize.define('company',
    {
        id:{
            type:Sequelize.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        name:{
            type:Sequelize.STRING
        },
        code:{
            type:Sequelize.STRING
        },
        e_id:{
            type:Sequelize.STRING
        },
        password:{
            type:Sequelize.STRING
        },
        industry:{
            type:Sequelize.STRING
        },
        country:{
            type: Sequelize.STRING
        },
        state:{
            type: Sequelize.STRING
        },
        city:{
            type: Sequelize.STRING
        }
    }
    );
    return companySchema;
}