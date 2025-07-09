const dbconfig = require('./dbconfig');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbconfig.DB, dbconfig.USER, dbconfig.PASSWORD, {
    host: dbconfig.HOST,
    dialect: dbconfig.dialect,
    logging:false
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.login = require('../model/loginModel')(sequelize, Sequelize);
db.company = require('../model/companyModel')(sequelize, Sequelize);
db.job = require('../model/jobModel')(sequelize, Sequelize);
db.user = require('../model/userModel')(sequelize, Sequelize);
db.field = require('../model/dynamicField')(sequelize, Sequelize);
db.application = require('../model/applications')(sequelize, Sequelize);
db.workFlow = require('../model/workFlow')(sequelize, Sequelize);
db.workFlowStage = require('../model/workFlowStage')(sequelize, Sequelize);
db.fieldOption = require('../model/fieldOptions')(sequelize, Sequelize);
db.fieldData = require('../model/fieldData')(sequelize, Sequelize);
db.portal = require('../model/portal')(sequelize, Sequelize);
db.template = require('../model/template')(sequelize, Sequelize);
db.templateField = require('../model/templateFields')(sequelize, Sequelize);
db.postOption = require('../model/postOptions')(sequelize, Sequelize);

module.exports = db;