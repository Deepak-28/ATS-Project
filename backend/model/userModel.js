module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: Sequelize.STRING,
        },
        firstname: {
            type: Sequelize.STRING,

        },
        lastname: {
            type: Sequelize.STRING,

        },
        email: {
            type: Sequelize.STRING,
        },
        ph_no: {
            type: Sequelize.BIGINT,

        },
        address: {
            type: Sequelize.STRING,

        },
        country: {
            type: Sequelize.STRING,

        },
        state: {
            type: Sequelize.STRING,
        },
        city: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
        skills: {
            type: Sequelize.STRING,
        },
        experience: {
            type: Sequelize.STRING,
        },
        education: {
            type: Sequelize.STRING,
        },
        resume: {
            type: Sequelize.STRING,
        },
        status: {
            type: Sequelize.STRING
        }
    });
    return User;
}