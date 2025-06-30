const Router = require('express').Router();
const { user,login,application } = require("../config/index");
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: async (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

Router.post('/', async (req, res) => {
    const { firstname, lastname, ph_no, address, country, state, city, email, password } = req.body;
    // console.log(req.body)
    try {
        const candidate = await user.create({ firstname, lastname, ph_no, address, country, state, city, email, password });
        const user_id = `A${String(candidate.id).padStart(3, '0')}`;
        candidate.user_id = user_id;
        await candidate.save();
        const useid = candidate.get({ plain: true }).id;
        const createLogin = await login.create({ candidateId: candidate.id, email, password, role: 'candidate' });
        // console.log(createLogin)
        res.status(201).send(' User created!', candidate);
    } catch (err) {
        res.status(500).send(err);
    }
});
Router.get('/applicants', async(req,res)=>{
    try{
        const data = await user.findAll();
        res.send(data)
    }catch(err){
        res.status(500).send(err.message)
    }

   
});
Router.get('/:id', async (req, res) => {
    const { id } = req.params;
    // console.log('test', id)
    try {
        const candidate = await user.findOne({ where: { id: id }, raw: true });
        // console.log(candidate)
        if (candidate) {
            res.send(candidate)
        }
        else {
            res.status(404).send( 'Candidate not found!');
        }
    } catch (err) {
        res.status(500).send( err.message );
    }
});
Router.get('/applicant/:id', async (req, res) => {
    const { id } = req.params;
    // console.log('test', id)
    try {
        const candidate = await user.findOne({ where: { id: id }, raw: true });
        // console.log(candidate)
        if (candidate) {
            res.send(candidate)
        }
        else {
            res.status(404).send( 'Applicant not found!');
        }
    } catch (err) {
        res.status(500).send( err.message );
    }
});
Router.get('/get-pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filepath);
});
Router.put('/:uid/:jid', upload.single('resume'), async (req, res) => {
    const { uid, jid } = req.params;
  
    try {
      const { firstname, lastname, email, ph_no, skills, experience, education } = JSON.parse(req.body.data);
      const resume = req.file ? req.file.filename : null;
  
      // Update user info
      const [updatedCount] = await user.update(
        {
          firstname,
          lastname,
          email,
          ph_no,
          skills,
          experience,
          education,
          ...(resume && { resume }) // Only update resume if file exists
        },
        { where: { id: uid } }
      );
  
      if (updatedCount === 0) {
        return res.status(404).send('Candidate not found or update failed.');
      }
  
      // Insert into Application table
      await application.create({
        candidateId: uid,
        jobId: jid,
        status: 'applied', // initial status
        appliedAt: new Date()
      });
  
      res.send('Job applied and candidate data updated successfully.');
    } catch (err) {
      console.error('Application error:', err);
      res.status(500).send('Something went wrong while applying for the job.');
    }
  });


  
module.exports = Router;