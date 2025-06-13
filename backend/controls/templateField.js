const Router = require("express").Router();
const {templateField} = require('../config/index');

Router.get('/all', async(req, res)=>{
    try{
        const data = await templateField.findAll();
        res.send(data);
    }catch(err){
        console.error("failed to fetcht the template fields",err)
    }
})
module.exports = Router;