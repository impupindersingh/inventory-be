const jwt = require('jsonwebtoken');
const config = require('../config');
const { users, sequelize, } = require('../models/index');
const bcrypt = require('bcrypt');

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
        let qry = `SELECT u.name, u.email, u.type, u.created_at, r.name "restaurantName", r.id "restaurantId" FROM users u
        LEFT JOIN admin_restaurant_assoc ara on ara.user_id = u.id 
        LEFT JOIN restaurants r on ara.restaurant_id  = r.id WHERE u.email = '${req.loggedInUserObj.email}' AND u.id = '${req.loggedInUserObj.userId}';`;
        let user = await sequelize.query(qry, { replacements: [], type: sequelize.QueryTypes.SELECT });
        res.data = user;
    } catch (error) {
        res.error = { error };
    }
    next();
}
