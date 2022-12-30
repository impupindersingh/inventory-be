const express = require('express');
const router = express.Router();

const authController = require('../controllers/authenticate-user.ct');
const { catchError } = require('../middleware/error-handler.mw');
const { sendResponse } = require('../middleware/send-response.mw');
const { getUserByOAuthToken } = require('../middleware/user.mw');
const { authenticationValidator  } = require('../middleware/validate.mw');


router.route('/login')
        .post(authenticationValidator, catchError(authController.login), sendResponse);

router.route('/profile')
        .get(getUserByOAuthToken, catchError(authController.getProfile), sendResponse);

module.exports = router;
