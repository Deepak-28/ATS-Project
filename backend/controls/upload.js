const Router = require('express').Router();
const path = require('path');

Router.get("/:filename", async(req, res)=>{
    const {filename} = req.params;
    const filePath = path.join(__dirname, "../uploads", filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('Error sending file:');
      res.status(500).send('Error sending file');
    }
  });
})

module.exports = Router;