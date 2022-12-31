const {
    sequelize,
    Sequelize,
    users } = require('../models/index');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
    addUser,
    updateUser,
    getUsers,
    deleteUser,
    addCategory,
    updateCategory,
    getCategory,
    deleteCategory,
    addRestaurant,
    updateRestaurant,
    getRestaurant,
    deleteRestaurant,
    addItem,
    updateItem,
    getItems,
    deleteItem,
    getOrders,
    updateSuperUser
};

async function updateSuperUser(req, res, next) {
    try {
        let payload = req.body;
        let qryData = [];
        if (payload.email) { qryData.push(`email='${payload.email}'`) }
        if (payload.password) {
            let password = await bcrypt.hash(payload.password, config.saltKey);
            qryData.push(`password='${password}'`)
        }
        // Update user
        let query = `UPDATE users SET ${qryData.join(', ')} WHERE id='${req.loggedInUserObj.userId}' AND type='${config.user_roles.superAdmin}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

// User's API
async function addUser(req, res, next) {
    try {
        let payload = req.body;
        let password = await bcrypt.hash(payload.password, config.saltKey);
        let userId = uuidv4();
        // Insert user
        let query = `INSERT INTO users (id, name, email, password, created_at, type, city, state, zip, address_line_1, address_line_2) 
        VALUES('${userId}', '${payload.name}', '${payload.email}', '${password}', now(), '${config.user_roles.admin}', '${payload.city}', '${payload.state}', '${payload.zip}', '${payload.addressLine1}', '${payload.addressLine2}');`;
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });

        // Map Restaurant 
        let query2 = `INSERT INTO admin_restaurant_assoc (id, user_id, restaurant_id, created_at) VALUES('${uuidv4()}', '${userId}', '${payload.assignedRestaurantId}', now());`;
        await sequelize.query(query2, { replacements: [], type: sequelize.QueryTypes.INSERT });
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function updateUser(req, res, next) {
    try {
        let payload = req.body;
        let userId = req.params.userId;
        let qryData = [];
        if (payload.name) { qryData.push(`name='${payload.name}'`) }
        if (payload.email) { qryData.push(`email='${payload.email}'`) }
        if (payload.password) {
            let password = await bcrypt.hash(payload.password, config.saltKey);
            qryData.push(`password='${password}'`)
        }
        if (payload.city) { qryData.push(`city='${payload.city}'`) }
        if (payload.state) { qryData.push(`state='${payload.state}'`) }
        if (payload.zip) { qryData.push(`zip='${payload.zip}'`) }
        if (payload.addressLine1) { qryData.push(`address_line_1='${payload.addressLine1}'`) }
        if (payload.addressLine2) { qryData.push(`address_line_2='${payload.addressLine2}'`) }
        // Update user
        let query = `UPDATE users SET ${qryData.join(', ')} WHERE id='${userId}' AND type='${config.user_roles.admin}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });

        // Update Restaurant 
        if (payload.assignedRestaurantId) {
            let query2 = `UPDATE admin_restaurant_assoc SET restaurant_id = '${payload.assignedRestaurantId}' WHERE user_id = '${userId}';`;
            await sequelize.query(query2, { replacements: [], type: sequelize.QueryTypes.UPDATE });
        }
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getUsers(req, res, next) {
    try {
        let query = `SELECT  u.id "userId", u.name, u.email, u.password, u.created_at "createdAt", u.type "userType", u.city, u.state, u.zip, u.address_line_1 "addressLine1", 
        u.address_line_2 "addressLine2", r.name "restaurantName", r.id "restaurantId" from users u
        inner join admin_restaurant_assoc ara on ara.user_id = u.id 
        inner join restaurants r on r.id = ara.restaurant_id 
        WHERE u.type='${config.user_roles.admin}' AND u.is_deleted=0;`;
        let users = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        res.data = { users };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function deleteUser(req, res, next) {
    try {
        let userId = req.params.userId;
        // Delete user
        let query = `UPDATE users SET is_deleted = 1 WHERE id='${userId}' AND type='${config.user_roles.admin}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });
        res.data = { message: 'deleted successfully' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

// Category API
async function addCategory(req, res, next) {
    try {
        let payload = req.body;
        // Create Category
        let query = `INSERT INTO category (id, name, created_at) VALUES('${uuidv4()}', '${payload.categoryName}', now());`;
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function updateCategory(req, res, next) {
    try {
        let payload = req.body;
        let categoryId = req.params.categoryId;
        // Update user
        let query = `UPDATE category SET name= '${payload.categoryName}' WHERE id='${categoryId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getCategory(req, res, next) {
    try {
        let query = `SELECT id "categoryId", name "categoryName", created_at "createdAt" FROM category where is_deleted = 0;`;
        let category = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        res.data = { category };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function deleteCategory(req, res, next) {
    try {
        let categoryId = req.params.categoryId;
        // Delete Category
        let query = `UPDATE category SET is_deleted = 1 WHERE id='${categoryId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });
        res.data = { message: 'deleted successfully' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

// Restaurant API
async function addRestaurant(req, res, next) {
    try {
        let payload = req.body;
        // Create Restaurant
        let query = `INSERT INTO restaurants (id, name, phone_number, city, state, zip, country, address_line_1, address_line_2, created_at) 
        VALUES('${uuidv4()}', '${payload.name}', '${payload.phoneNumber}', '${payload.city}', '${payload.state}', '${payload.zip}', '${payload.country}', '${payload.addressLine1}', '${payload.addressLine2}', now());`;
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function updateRestaurant(req, res, next) {
    try {
        let payload = req.body;
        let restaurantId = req.params.restaurantId;
        let qryData = [];
        if (payload.name) { qryData.push(`name='${payload.name}'`) }
        if (payload.phoneNumber) { qryData.push(`phone_number='${payload.phoneNumber}'`) }
        if (payload.city) { qryData.push(`city='${payload.city}'`) }
        if (payload.state) { qryData.push(`state='${payload.state}'`) }
        if (payload.zip) { qryData.push(`zip='${payload.zip}'`) }
        if (payload.country) { qryData.push(`country='${payload.country}'`) }
        if (payload.addressLine1) { qryData.push(`address_line_1='${payload.addressLine1}'`) }
        if (payload.addressLine2) { qryData.push(`address_line_2='${payload.addressLine2}'`) }

        // Update Restaurant
        let query = `UPDATE restaurants SET ${qryData.join(', ')} WHERE id='${restaurantId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getRestaurant(req, res, next) {
    try {
        let query = `SELECT id "restaurantId", name "restaurantName", phone_number "phoneNumber", city, state, zip, country, address_line_1 "addressLine1", address_line_2 "addressLine2", created_at "createdAt" FROM restaurants where is_deleted = 0;`;
        let restaurants = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        res.data = { restaurants };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function deleteRestaurant(req, res, next) {
    try {
        let restaurantId = req.params.restaurantId;
        // Delete Category
        let query = `UPDATE restaurants SET is_deleted = 1 WHERE id='${restaurantId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });
        res.data = { message: 'deleted successfully' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

// Item's API
async function addItem(req, res, next) {
    try {
        let payload = req.body;
        // Insert Item
        let query = `INSERT INTO items (id, name, category_id, description, created_at, unit_type) 
        VALUES('${uuidv4()}', '${payload.itemName}', '${payload.categoryId}', '${payload.description}', now(), '${payload.unitType}');`;
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function updateItem(req, res, next) {
    try {
        let payload = req.body;
        let itemId = req.params.itemId;
        let qryData = [];
        if (payload.itemName) { qryData.push(`name='${payload.itemName}'`) }
        if (payload.categoryId) { qryData.push(`category_id='${payload.categoryId}'`) }
        if (payload.description) { qryData.push(`description='${payload.description}'`) }
        if (payload.unitType) { qryData.push(`unit_type='${payload.unitType}'`) }

        // Update user
        let query = `UPDATE items SET ${qryData.join(', ')} WHERE id='${itemId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getItems(req, res, next) {
    try {
        let query = `SELECT i.id "itemId", i.name "itemName", i.category_id "categoryId", i.description, i.created_at "createdAt", i.unit_type "unitType", c.name "categoryname"
        FROM items i inner join category c on c.id  = i.category_id where i.is_deleted = 0;`;
        let items = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        res.data = { items };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function deleteItem(req, res, next) {
    try {
        let itemId = req.params.itemId;
        // Delete user
        let query = `UPDATE items SET is_deleted = 1 WHERE id='${itemId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });
        res.data = { message: 'deleted successfully' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

// Orders API
async function getOrders(req, res, next) {
    try {
        let orders = {};
        if (req.query.restaurantId) {
            let query = `select o.id "orderId", i.name "itemName", i.unit_type "unitType", c.name "categoryName", o.quantity, u.name, u.id "userId", 
            o.created_at "createdAt", r.name "restaurantName", r.id "restaurantId"
            from orders o 
            inner join items i on i.id = o.item_id 
            inner join category c on c.id = i.category_id 
            inner join users u on u.id = o.user_id 
            inner join admin_restaurant_assoc ara on ara.user_id = u.id 
            inner join restaurants r on r.id = ara.restaurant_id  and u.id = ara.user_id 
            where r.id = '${req.query.restaurantId}' order by o.created_at desc`;
            orders = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        } else {
            let query = `select i.name "itemName", i.unit_type "unitType", c.name "categoryName", SUM(o.quantity) "quantity", CAST(o.created_at AS DATE) "createdAt" from orders o  
            inner join items i on i.id = o.item_id  
            inner join category c on c.id = i.category_id  
            inner join users u on u.id = o.user_id  
            group by i.id, CAST(o.created_at AS DATE)`;
            orders = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        }
        res.data = { orders };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}