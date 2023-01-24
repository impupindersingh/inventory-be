const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.ct');
const { getUserByOAuthToken, isAdmin } = require('../middleware/user.mw');
const { catchError } = require('../middleware/error-handler.mw');
const { sendResponse } = require('../middleware/send-response.mw');
const { addOrderValidator, updateOrderStatusValidator, getOrderValidator } = require('../middleware/validate.mw');

// Orders API
router.route('/order')
    .post(getUserByOAuthToken, isAdmin, addOrderValidator,
        catchError(adminController.addOrder), sendResponse);

router.route('/order/:orderId')
    .delete(getUserByOAuthToken, isAdmin,
        catchError(adminController.deleteOrder), sendResponse);

router.route('/order')
    .get(getUserByOAuthToken, isAdmin, getOrderValidator,
        catchError(adminController.getOrder), sendResponse);

router.route('/item-category')
    .get(getUserByOAuthToken, isAdmin,
        catchError(adminController.getItemCategory), sendResponse);

router.route('/users')
    .get(getUserByOAuthToken, isAdmin,
        catchError(adminController.getUsers), sendResponse);

router.route('/order-status')
    .put(getUserByOAuthToken, isAdmin, updateOrderStatusValidator,
        catchError(adminController.updateOrderStatus), sendResponse);

// News Bulletin for order
router.route('/orders-as-news')
        .get(getUserByOAuthToken, isAdmin,
                catchError(adminController.getOrdersAsNews), sendResponse);
module.exports = router;