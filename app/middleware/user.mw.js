const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {
    getUserByOAuthToken,
    isSuperAdmin,
    isAdmin
};

async function isSuperAdmin(req, res, next) {
    if (req.loggedInUserObj.type === config.user_roles.superAdmin) {
        next();
    } else {
        return res.status(401).json({ error: { message: 'not a valid Role for request.' } });
    }
}

async function isAdmin(req, res, next) {
    if (req.loggedInUserObj.type === config.user_roles.admin) {
        next();
    } else {
        return res.status(401).json({ error: { message: 'not a valid Role for request.' } });
    }
}

async function getUserByOAuthToken(req, res, next) {
    let authTemp = req.headers.authorization;
    if (authTemp == null || authTemp == undefined) {
        return res.status(401).json({ error: { message: 'authentication failed.' } });
    }
    let token = authTemp.replace('Bearer ', '');

    if (token == null || token == undefined || token == '') {
        res.auth_failed = {
            message: 'token not found.'
        };
        return;
    }
    let decodedToken = jwt.decode(token, { complete: true });
    if (decodedToken && decodedToken.payload.email) {
        try {
            let verifiedToken = await jwt.verify(token, config.jwt.secretKey);
            if (!verifiedToken) {
                return res.status(401).json({ error: { message: 'token expired.' } });
            }
            req.loggedInUserObj = { userId: decodedToken.payload.userId, email: decodedToken.payload.email, type: decodedToken.payload.type }
        } catch (e) {
            return res.status(401).json({ error: e });
        }
    } else {
        return res.status(401).json({ error: { message: 'token decode unsuccessful.' } });
    }
    next();
}


