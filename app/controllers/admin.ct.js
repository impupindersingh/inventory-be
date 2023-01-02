const { sequelize } = require('../models/index');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
    addOrder,
    getOrder,
    getItemCategory,
    getUsers
};

// Orders API
async function addOrder(req, res, next) {
    try {
        let payload = req.body;
        if (payload.length) {
            let insertAry=[];
            payload.forEach(ele => {
                insertAry.push(`('${uuidv4()}', '${ele.itemId}', now(), '${ele.quantity}', '${req.loggedInUserObj.userId}')`)
            });
            // Insert Order        
            let query = `INSERT INTO orders (id, item_id, created_at, quantity, user_id) VALUES ${insertAry.join(', ')};`
            await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });
        }
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getOrder(req, res, next) {
    try {
        let orders = {};
        let userId = (req.query.userId) ? req.query.userId : req.loggedInUserObj.userId;
        let query = `select o.id "orderId", i.name "itemName", i.unit_type "unitType", c.name "categoryName", o.quantity, u.name, u.id "userId", 
            o.created_at "createdAt", r.name "restaurantName", r.id "restaurantId"
            from orders o 
            inner join items i on i.id = o.item_id 
            inner join category c on c.id = i.category_id 
            inner join users u on u.id = o.user_id 
            inner join admin_restaurant_assoc ara on ara.user_id = u.id 
            inner join restaurants r on r.id = ara.restaurant_id  and u.id = ara.user_id 
            where u.id = '${userId}' order by createdAt desc `;
        orders = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        res.data = { orders };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getItemCategory(req, res, next) {
    try {
        // Get Categories
        let catQry = `select c.id "categoryId", c.name "categoryName" from category c where c.is_deleted = 0`;
        let category = await sequelize.query(catQry, { replacements: [], type: sequelize.QueryTypes.SELECT });

        // Get Items
        let itemQry = `select i.id "itemId", i.name "itemName", i.unit_type "itemUnitType", i.category_id "categoryId" from items i where i.is_deleted = 0`;
        let items = await sequelize.query(itemQry, { replacements: [], type: sequelize.QueryTypes.SELECT });
        res.data = { category, items };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getUsers(req, res, next) {
    try {
        // Get Admin users
        let userQry = `select u.id "userId", name "userName", email, type "userType" from users u where u.type = '${config.user_roles.admin}' and is_deleted = 0`;
        let adminUsers = await sequelize.query(userQry, { replacements: [], type: sequelize.QueryTypes.SELECT });
        res.data = { adminUsers };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}