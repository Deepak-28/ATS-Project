const express = require('express');
const router = express.Router();
const {fieldOption} = require('../config/index');


router.get('/all', async(req, res)=>{
    try{
        const fieldOptions = await fieldOption.findAll();
        res.send(fieldOptions);
        // console.log(fieldOptions);
        
        
    }catch(error){
        console.error("Error in fectching options", error)
    }
})
module.exports = router;