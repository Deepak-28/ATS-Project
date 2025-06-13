const Router = require('express').Router();
const {portal} = require('../config/index');

Router.post('/', async(req, res)=>{
    // console.log(req.body);
    const {Name, maskId} = req.body;
    // console.log(Name, maskId);
    try{
        const url = await portal.create({Name, maskId})
        res.send("portal created!")
    }catch(err){
        console.error("Error in creating portal", err)
    }
})
Router.get('/', async(req,res)=>{
    try{
        const data = await portal.findAll()
        res.send(data)
    }catch(err){
        console.error("failed to fetch portals",err)
    }
})
module.exports = Router;