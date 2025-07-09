const Router = require("express").Router();
const {templateField, field, fieldOption} = require('../config/index');

Router.get('/all/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const templateFields = await templateField.findAll({
      where: { templateId: id },
      raw: true
    });

    const fieldIds = [...new Set(templateFields.map(item => item.fieldId))];

    const fields = await field.findAll({
      where: { id: fieldIds },
      raw: true
    });

    const options = await fieldOption.findAll({
      where: { fieldId: fieldIds },
      raw: true
    });

    // Group options by fieldId
    const optionMap = {};
    options.forEach(opt => {
      if (!optionMap[opt.fieldId]) optionMap[opt.fieldId] = [];
      optionMap[opt.fieldId].push(opt);
    });

    // Merge fields + options
    const fieldMap = {};
    fields.forEach(field => {
      fieldMap[field.id] = {
        ...field,
        options: optionMap[field.id] || []
      };
    });

    const merged = templateFields.map(tf => ({
      ...tf,
      field: fieldMap[tf.fieldId] || null
    }));
    // console.log(merged);
    
    res.send(merged);
  } catch (err) {
    console.error("Error fetching template fields:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = Router;