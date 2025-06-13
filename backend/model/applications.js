module.exports = (sequelize, DataTypes) => {
    const Application = sequelize.define('Application', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
       
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING, // dynamic status
    
      },
      appliedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, );
  
    return Application;
  };
  