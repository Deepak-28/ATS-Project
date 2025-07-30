const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/index');
const Router = require('./router');
const path = require('path');
const cron = require('./cronJobs');

dotenv.config();

const Port = process.env.PORT || 7000;
const app = express();
app.use(cors());
app.use(express.json());
app.use('/', Router);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

db.sequelize.sync({alter:true}).then(()=>{
    console.log("Database Connected");
})
.catch((err)=>{
    console.log("Database connection failed",err)
})
app.listen(Port, ()=>{
    console.log(`Port is Running on ${Port}`);
});