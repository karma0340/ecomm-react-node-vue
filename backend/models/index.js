'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// ===== Load Sequelize Config =====
let config;
try {
  config = require(path.resolve(__dirname, '../config/config.js'))[env];
} catch (err) {
  console.error('Error loading Sequelize config:', err);
  process.exit(1);
}

// ===== Initialize Sequelize =====
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

// ===== Import All Models =====
fs
  .readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    !file.endsWith('.test.js')
  )
  .forEach(file => {
    // If the model exports a function (standard Sequelize CLI style)
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// ===== Setup Model Associations =====
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ===== Export Sequelize and Models =====
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
