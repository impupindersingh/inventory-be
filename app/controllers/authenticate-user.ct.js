const jwt = require('jsonwebtoken');
const config = require('../config');
const { users } = require('../models/index');
const bcrypt = require('bcrypt');

const auth0_conf = config.auth0_conf;
const auth0_api = config.auth0_api;
const login_conf = config.login_conf;

module.exports = {
    login,
    getProfile,
};

async function login(req, res, next) {
    console.log('<<== authenticate user ==>>');
    try {
        const user = await users.findOne({
            where: {
                email: req.body.username,
                type: req.body.type
            },
            attributes: ['id', 'name', 'email', 'password', 'type']
        });
        if (!user) {
            res.error = { message: 'User doesn\'t exists.' };
            return next();
        }
        let result = await bcrypt.compare(req.body.password, user.password || '');
        if (!result) {
            res.error = { message: 'Invalid Password' };
            return next();
        }
        let date = new Date().toISOString();
        let userObj = {
            userId: user.id,
            name: user.name,
            email: user.email,
            created_at: date,
            type: user.type
        };
        let token = await jwt.sign(userObj, config.jwt.secretKey, { expiresIn: config.jwt.accessExpiryIn });
        res.data = {
            token,
            expiresIn: config.jwt.accessExpiryIn
        };

    } catch (error) {
        console.error('authenticateUser error::::', error);
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getProfile(req, res, next) {
    try {
        const user = await users.findOne({
            where: {
                email: req.loggedInUserObj.email,
                id: req.loggedInUserObj.userId
            },
            attributes: ['name', 'email', 'type', 'created_at']
        });
        res.data = user;
    } catch (error) {
        res.error = { error };
    }
    next();
}
