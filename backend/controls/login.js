const Router = require('express').Router();
const {login} = require('../config/index');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET

Router.post('/check', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await login.findOne({
        where: { email, password },
        raw: true
      });
    //   console.log(user);
      if (!user) {
        return res.status(404).send("Invalid email or password");
      }
  
        const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        candidateId: user.candidateId,
        cid: user.cid,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.send({ token });

    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
});
Router.post('/admin/users', async (req, res) => {
    const { username, email, password, role, companyId } = req.body;
    try {
      const newUser = await login.create({ username:username, email:email, password:password, role:role, cid:companyId });
      res.status(201).send(newUser);
    } catch (error) {
      res.status(500).send( 'User creation failed',err);
    }
});
Router.get('/user', async (req, res) => {
    try {
        const data = await login.findAll();
        res.json(data); // sends data as JSON array to the frontend
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Failed to fetch users");
    }
    
});
Router.get('/user/:id', async(req, res)=>{
    const id = req.params.id;
    try{
        const data = await login.findOne({where:{id}, raw:true})
        if(data){
            res.send(data)
        }
        else{
            res.send("User Not Found")
        }
    }catch(err){
        res.send("Server Error")
    }
    // console.log(data);
});
Router.get('/admin/user/:id', async(req, res)=>{
    const id = req.params.id;
    try{
        const data = await login.findOne({where:{id}, raw:true})
        if(data){
            res.send(data)
        }
        else{
            res.send("User Not Found")
        }
    }catch(err){
        res.send("Server Error")
    }
    // console.log(data);
    
})
Router.get('/all', async (req, res) => {
  try {
    const data = await login.findAll({
      where: {
         cid: {
    [Op.ne]: null
  }
      }
    });
    res.send(data);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Failed to fetch users");
  }
});
Router.get("/user/company/:companyId", async (req, res) => {
    const { companyId } = req.params;
    try {
      const users = await login.findAll({ where: { cid:companyId } }); // Adjust model if needed
      res.status(200).send(users);
    } catch (err) {
      console.error("Error fetching users for company:", err);
      res.status(500).send ("Failed to fetch users",err );
    }
});  
Router.delete('/user/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await login.destroy({ where: { id } });

        if (deleted) {
            res.send("User deleted successfully");
        } else {
            res.status(404).send("User not found");
        }
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).send("Failed to delete user");
    }
});
Router.put('/admin/user/:id', async (req,res)=>{
    const {id} = req.params;
    const data = req.body;
    try{
        const update_user = await login.update(data,{where:{id}, raw:true});
        if(update_user){
            res.send('User Updated');
        }else{
            res.status(404).send("User Not Found")
        }
    }catch(err){
        res.status(500).send("Update Failed")
    }
});



module.exports = Router;