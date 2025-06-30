const Router = require('express').Router();
const {portal} = require('../config/index');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

Router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { Name, maskId } = req.body;
    const file = req.file;

    if (!Name || !maskId || !file) {
      return res.status(400).send("All fields including image are required.");
    }

    const imagePath = `/uploads/${file.filename}`;

    const newPortal = await portal.create({
      Name,
      maskId,
      backgroundImage: imagePath,
    });

    res.status(201).send("Portal created successfully!");
  } catch (err) {
    console.error("Error creating portal:", err);
    res.status(500).send("Server error");
  }
});
Router.get("/:slug", async(req, res)=>{
  const {slug} = req.params;
  // console.log(slug);
  
  try {
    const portalData = await portal.findOne({ where: { maskId:slug } });
    if (!portalData) {
      return res.status(404).send("Portal not found");
    }

    res.json({
      Name: portalData.Name,
      backgroundImage: portalData.backgroundImage,
      type: portalData.type,
    });
  } catch (err) {
    console.error("Error fetching portal:", err);
    res.status(500).send("Server error");
  }
})
Router.get('/', async(req,res)=>{
    try{
        const data = await portal.findAll()
        res.send(data)
    }catch(err){
        console.error("failed to fetch portals",err)
    }
});
Router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { Name, maskId } = req.body;
  const file = req.file;

  try {
    const portalData = await portal.findOne({where:{id}});
    if (!portalData) {
      return res.status(404).send("Portal not found");
    }

    portalData.Name = Name;
    portalData.maskId = maskId;
    if (file) {
      portalData.backgroundImage = `/uploads/${file.filename}`;
    }

    await portalData.save();

    res.status(200).send("Portal updated");
  } catch (err) {
    console.error("Error updating portal:", err);
    res.status(500).send("Server error");
  }
});

Router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await portal.destroy({where:{id}});
    if (!deleted) {
      return res.status(404).send("Portal not found.");
    }
    res.send("Portal deleted successfully!");
  } catch (err) {
    console.error("Error deleting portal:", err);
    res.status(500).send("Error deleting portal.");
  }
});
module.exports = Router;