module.exports = (sequelize, Sequelize) => {
  const DynamicField = sequelize.define("DynamicField", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyId: {
      type: Sequelize.INTEGER,
    },
    formType: {
      type: Sequelize.ENUM("job", "candidate"),
    },
    fieldCode:{
      type: Sequelize.STRING,
    },
    fieldLabel: {
      type: Sequelize.STRING,
    },
    fieldType: {
      type: Sequelize.STRING, // 'text', 'number', 'select', etc.
    },
    options: {
      type: Sequelize.TEXT, // for dropdown/checkbox options (comma-separated)
    },
    isRequired: {
      type: Sequelize.BOOLEAN,
    },
    isActive:{
      type: Sequelize.BOOLEAN,
    },
    isDuplicate:{
      type: Sequelize.BOOLEAN
    }
  });

  return DynamicField;
};
