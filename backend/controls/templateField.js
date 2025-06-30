const Router = require("express").Router();
const {templateField} = require('../config/index');

Router.get('/all/:id', async(req, res)=>{
    // const {id} = req.params;
    // console.log(id);
    
    try{
        const data = await templateField.findAll();
        res.send(data);
    }catch(err){
        console.error("failed to fetcht the template fields",err)
    }
})
module.exports = Router;