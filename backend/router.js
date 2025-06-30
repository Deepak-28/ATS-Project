const Router = require('express').Router();

Router.get('/', (req, res)=>{
    res.send('Get Working')
});

Router.use('/login', require('./controls/login'));
Router.use('/company', require('./controls/company'));
Router.use('/job', require('./controls/jobs'));
Router.use('/user', require('./controls/user'));
Router.use('/fields', require('./controls/fields'));
Router.use('/application', require('./controls/application'));
Router.use('/workFlow', require('./controls/workFlow'));
Router.use('/workFlowStage', require('./controls/workFlowStage'));
Router.use('/fieldOption', require('./controls/fieldOptions'));
Router.use('/uploads', require("./controls/upload"));
Router.use('/fieldData', require('./controls/fieldData'));
Router.use('/portal', require('./controls/portal'));
Router.use('/template', require('./controls/template'));
Router.use('/templateField', require('./controls/templateField'));

module.exports =Router;
