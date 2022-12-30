const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.ct');
const { getUserByOAuthToken, isAdmin } = require('../middleware/user.mw');
const { catchError } = require('../middleware/error-handler.mw');
const { sendResponse } = require('../middleware/send-response.mw');
const { addOrderValidator } = require('../middleware/validate.mw');

// Orders API
router.route('/order')
    .post(getUserByOAuthToken, isAdmin, addOrderValidator,
        catchError(adminController.addOrder), sendResponse);

router.route('/order')
    .get(getUserByOAuthToken, isAdmin,
        catchError(adminController.getOrder), sendResponse);

router.route('/item-category')
    .get(getUserByOAuthToken, isAdmin,
        catchError(adminController.getItemCategory), sendResponse);

module.exports = router;