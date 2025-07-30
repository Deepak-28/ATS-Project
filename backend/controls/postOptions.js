const Router = require('express').Router();
const {postOption} = require('../config/index')
Router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await postOption.findAll({ where: { jobId: id }, raw: true });

    const formattedData = data.map(item => {
      const postDate = new Date(item.postDate);
      const expiryDate = new Date(item.expiryDate);

      return {
        ...item,
        postDate: isValidDate(postDate) ? postDate.toISOString().slice(0, 10) : null,
        expiryDate: isValidDate(expiryDate) ? expiryDate.toISOString().slice(0, 10) : null,
      };
    });

    res.send(formattedData);
  } catch (err) {
    console.error("Error in the Getting PostOptions", err);
    res.status(500).send("Error fetching post options");
  }
});

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}


module.exports = Router;