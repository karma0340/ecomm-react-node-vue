'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Load config
let config;
try {
  config = require(path.resolve(__dirname, '../config/config.js'))[env];
} catch (err) {
  console.error('Error loading Sequelize config:', err);
  process.exit(1);
}

// Init sequelize
let sequelize;
try {
  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }
} catch (err) {
  console.error('Error initializing Sequelize:', err);
  process.exit(1);
}

const db = {};

// Read all JS model files except this one, and auto-import
fs
  .readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&                       // Not hidden
    file !== basename &&                             // Not this index.js file itself
    file.slice(-3) === '.js' &&                      // Only .js files
    !file.endsWith('.test.js')                       // Not test files
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Set up model associations, if defined
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add sequelize instance and class to the db object for export
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
