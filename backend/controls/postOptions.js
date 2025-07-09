const Router = require('express').Router();
const {postOption} = require('../config/index')
Router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await postOption.findAll({ where: { jobId: id }, raw: true });

    // Slice postDate and expiryDate to only 'YYYY-MM-DD'
    const formattedData = data.map(item => ({
      ...item,
      postDate: item.postDate?.toISOString().slice(0, 10),
      expiryDate: item.expiryDate?.toISOString().slice(0, 10)
    }));

    res.send(formattedData);
  } catch (err) {
    console.error("Error in the Getting PostOptions", err);
    res.status(500).send("Error fetching post options");
  }
});

module.exports = Router;