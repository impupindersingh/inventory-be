const express = require('express');
const router = express.Router();

const superAdminController = require('../controllers/super-admin.ct');
const { getUserByOAuthToken, isSuperAdmin } = require('../middleware/user.mw');
const { catchError } = require('../middleware/error-handler.mw');
const { sendResponse } = require('../middleware/send-response.mw');
const { addUserValidator, updateUserValidator, addCatValidator, addRestaurantValidator, updateRestaurantValidator, addItemValidator,
        updateItemValidator, updateSuperUserValidator, getOrderValidator, updateSAOrderStatusValidator, getItemHistoryValidator } = require('../middleware/validate.mw');

router.route('/')
        .put(getUserByOAuthToken, isSuperAdmin, updateSuperUserValidator,
                catchError(superAdminController.updateSuperUser), sendResponse);

// User's API
router.route('/user')
        .post(getUserByOAuthToken, isSuperAdmin, addUserValidator,
                catchError(superAdminController.addUser), sendResponse);

router.route('/user/:userId')
        .put(getUserByOAuthToken, isSuperAdmin, updateUserValidator,
                catchError(superAdminController.updateUser), sendResponse);

router.route('/user')
        .get(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.getUsers), sendResponse);

router.route('/user/:userId')
        .delete(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.deleteUser), sendResponse);

// Category API
router.route('/category')
        .post(getUserByOAuthToken, isSuperAdmin, addCatValidator,
                catchError(superAdminController.addCategory), sendResponse);

router.route('/category/:categoryId')
        .put(getUserByOAuthToken, isSuperAdmin, addCatValidator,
                catchError(superAdminController.updateCategory), sendResponse);

router.route('/category')
        .get(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.getCategory), sendResponse);

router.route('/category/:categoryId')
        .delete(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.deleteCategory), sendResponse);


// Restaurant API
router.route('/restaurant')
        .post(getUserByOAuthToken, isSuperAdmin, addRestaurantValidator,
                catchError(superAdminController.addRestaurant), sendResponse);

router.route('/restaurant/:restaurantId')
        .put(getUserByOAuthToken, isSuperAdmin, updateRestaurantValidator,
                catchError(superAdminController.updateRestaurant), sendResponse);

router.route('/restaurant')
        .get(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.getRestaurant), sendResponse);

router.route('/restaurant/:restaurantId')
        .delete(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.deleteRestaurant), sendResponse);

// Restaurant API
router.route('/item')
        .post(getUserByOAuthToken, isSuperAdmin, addItemValidator,
                catchError(superAdminController.addItem), sendResponse);

router.route('/item/:itemId')
        .put(getUserByOAuthToken, isSuperAdmin, updateItemValidator,
                catchError(superAdminController.updateItem), sendResponse);

router.route('/item')
        .get(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.getItems), sendResponse);

router.route('/item/:itemId')
        .delete(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.deleteItem), sendResponse);

router.route('/item/unit-type')
        .get(getUserByOAuthToken, isSuperAdmin,
                catchError(superAdminController.getItemsUnitType), sendResponse);

// Orders API
router.route('/orders')
        .get(getUserByOAuthToken, isSuperAdmin, getOrderValidator,
                catchError(superAdminController.getOrders), sendResponse);

router.route('/order-status')
        .put(getUserByOAuthToken, isSuperAdmin, updateSAOrderStatusValidator,
                catchError(superAdminController.updateOrderStatus), sendResponse);

router.route('/item-history')
        .get(getUserByOAuthToken, isSuperAdmin, getItemHistoryValidator,
                catchError(superAdminController.getItemHistory), sendResponse);

module.exports = router;
