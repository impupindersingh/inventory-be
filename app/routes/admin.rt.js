const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.ct');
const { getUserByOAuthToken, isAdmin } = require('../middleware/user.mw');
const { catchError } = require('../middleware/error-handler.mw');
const { sendResponse } = require('../middleware/send-response.mw');
const { addOrderValidator, updateOrderStatusValidator, getOrderValidator, updateInventoryValidator } = require('../middleware/validate.mw');

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

/****
* 
* 
Transfer Item Module
* 
* 
****/
router.route('/transfer/transfer-items')
    .get(getUserByOAuthToken, isAdmin,
        catchError(adminController.getTransferItems), sendResponse);

router.route('/transfer/inventory')
    .put(getUserByOAuthToken, isAdmin, updateInventoryValidator,
        catchError(adminController.updateInventory), sendResponse);

router.route('/transfer/stock-in')
    .get(getUserByOAuthToken, isAdmin,
        catchError(adminController.getStockIn), sendResponse);

router.route('/transfer/stock-out')
    .get(getUserByOAuthToken, isAdmin,
        catchError(adminController.getStockOut), sendResponse);

module.exports = router;