'use strict';

let fs = require('fs');
let path = require('path');
let Sequelize = require('sequelize');
let config = require('../config');

function init(config) {
    let db = {};
    let sequelize = new Sequelize(config);

    fs
        .readdirSync(__dirname + '/models')
        .filter(file => {
            return (file.indexOf('.') !== 0) && (file.slice(-3) === '.js');
        })
        .forEach(file => {
            let model = sequelize.import(path.join(__dirname, 'models', file));
            db[model.name] = model;
        });

    Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;

}

let models = init(config.dbconnection);
module.exports = models;

