const {
    sequelize,
    Sequelize,
    users } = require('../models/index');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const moment = require('moment');
const momenttz = require('moment-timezone');

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
    getItemsUnitType,
    deleteItem,
    getOrders,
    updateSuperUser,
    updateOrderStatus,
    getItemHistory,
    deleteOrder,
    getOrdersAsNews,
    addTransferItem,
    updateTransferItem,
    getTransferItems,
    deleteTransferItem,
    addTransferOrder,
    getOrderedTransferItems,
    getStockOut,
    getStockConsumed
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
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        // Insert user
        let query = `INSERT INTO users (id, name, email, password, created_at, type, city, state, zip, address_line_1, address_line_2) 
        VALUES('${userId}', '${payload.name}', '${payload.email}', '${password}', '${nowTime}', '${config.user_roles.admin}', '${payload.city}', '${payload.state}', '${payload.zip}', '${payload.addressLine1}', '${payload.addressLine2}');`;
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });

        // Map Restaurant 
        let query2 = `INSERT INTO admin_restaurant_assoc (id, user_id, restaurant_id, created_at) VALUES('${uuidv4()}', '${userId}', '${payload.assignedRestaurantId}', '${nowTime}');`;
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
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        // Create Category
        let query = `INSERT INTO category (id, name, created_at) VALUES('${uuidv4()}', '${payload.categoryName}', '${nowTime}');`;
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
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        // Create Restaurant
        let query = `INSERT INTO restaurants (id, name, phone_number, city, state, zip, country, address_line_1, address_line_2, created_at) 
        VALUES('${uuidv4()}', '${payload.name}', '${payload.phoneNumber}', '${payload.city}', '${payload.state}', '${payload.zip}', '${payload.country}', '${payload.addressLine1}', '${payload.addressLine2}', '${nowTime}');`;
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
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        // Insert Item
        let query = `INSERT INTO items (id, name, category_id, description, created_at, unit_type) 
        VALUES('${uuidv4()}', '${payload.itemName}', '${payload.categoryId}', '${payload.description}', '${nowTime}', '${payload.unitType}');`;
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
        FROM items i inner join category c on c.id  = i.category_id where i.is_deleted = 0 order by i.name ASC;`;
        let items = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        res.data = { items };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getItemsUnitType(req, res, next) {
    try {
        res.data = { unitType: config.item_units };
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
        let startDate = `${req.query.startDate} 00:00:00`;
        let endDate = `${req.query.endDate} 23:59:59`;
        if (req.query.restaurantId) {
            let query = `select o.id "orderId", i.name "itemName", i.unit_type "unitType", c.name "categoryName", o.quantity, u.name, u.id "userId", 
            CAST(o.created_at AS DATE) "createdAt", r.name "restaurantName", r.id "restaurantId", o.status "orderStatus", o.new_request_date "newRequestDate", 
            o.bought_date "boughtDate", o.received_date "receivedDate", o.actual_quantity "receivedQty", o.note_qty "noteReceivedQty"
            from orders o 
            inner join items i on i.id = o.item_id 
            inner join category c on c.id = i.category_id 
            inner join users u on u.id = o.user_id 
            inner join admin_restaurant_assoc ara on ara.user_id = u.id 
            inner join restaurants r on r.id = ara.restaurant_id  and u.id = ara.user_id 
            where r.id = '${req.query.restaurantId}' AND o.created_at between '${startDate}' AND '${endDate}' order by (o.status = '${config.item_status.newRequest}') DESC, c.name ASC, i.name ASC`;
            orders = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
            orders.map(ele => {
                if (ele.orderStatus === config.item_status.newRequest) {
                    delete ele.receivedQty;
                    delete ele.noteReceivedQty;
                }
            })
        } else {
            let query = `select i.name "itemName", i.unit_type "unitType", c.name "categoryName", SUM(o.quantity) "quantity", CAST(o.created_at AS DATE) "createdAt" from orders o  
            inner join items i on i.id = o.item_id  
            inner join category c on c.id = i.category_id  
            inner join users u on u.id = o.user_id
            where o.created_at between '${startDate}' AND '${endDate}'
            group by i.id, CAST(o.created_at AS DATE) order by i.name ASC`;
            orders = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        }
        res.data = { orders };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function updateOrderStatus(req, res, next) {
    try {
        let payload = req.body;
        if (payload.length) {
            let receivedOrderIds = [];
            let boughtOrderIds = [];
            const tz = momenttz().tz('US/Eastern');
            const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
            payload.forEach(ele => {
                (config.item_status.received === ele.status) && receivedOrderIds.push(JSON.stringify(ele.orderId));
                if (config.item_status.bought === ele.status) {
                    const note = (ele.note) ? ele.note : null;
                    boughtOrderIds.push(sequelize.query(`UPDATE orders SET status='${config.item_status.bought}', bought_date='${nowTime}', actual_quantity='${ele.acceptedQty}', note_qty='${note}'  WHERE id='${ele.orderId}' AND status = '${config.item_status.newRequest}';`, { replacements: [], type: sequelize.QueryTypes.UPDATE }));
                }
            });
            if (receivedOrderIds.length) {
                // Update Order        
                let query = `UPDATE orders SET status='${config.item_status.received}', received_date='${nowTime}' WHERE 
                id IN (${receivedOrderIds.join(',')}) AND status = '${config.item_status.bought}';`
                await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });
            }
            if (boughtOrderIds.length) {
                // Update Order
                await Promise.all(boughtOrderIds);
            }
        }
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getItemHistory(req, res, next) {
    try {
        const restaurantId = req.query.restaurantId;
        const items = req.query.items.split(',');
        const replacements = { restaurantId, items }
        let query = `select GROUP_CONCAT(DISTINCT u.name SEPARATOR ',') as adminName, i.name "itemName", c.name "categoryName", SUM(o.quantity) "quantity", i.unit_type "unitType", CAST(o.created_at AS DATE) "createdAt", r.name "restaurantName"
        from orders o 
        inner join items i on i.id = o.item_id 
        inner join category c on c.id = i.category_id 
        inner join users u on u.id = o.user_id 
        inner join admin_restaurant_assoc ara on ara.user_id = u.id 
        inner join restaurants r on r.id = ara.restaurant_id  and u.id = ara.user_id 
        where r.id = :restaurantId and o.item_id in (:items)
        group by i.id, CAST(o.created_at AS DATE) order by i.name ASC`;
        let itemHistory = await sequelize.query(query, { replacements, type: sequelize.QueryTypes.SELECT });
        itemHistory.sort(function (a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        res.data = { itemHistory };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function deleteOrder(req, res, next) {
    try {
        let orderId = req.params.orderId;
        if (orderId) {
            // DELETE Order        
            let query = `DELETE FROM orders WHERE id='${orderId}' AND status = '${config.item_status.newRequest}';`
            await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.DELETE });
        }
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getOrdersAsNews(req, res, next) {
    try {
        let ordersNews = {};
        if (req.query.restaurantId) {
            let query = `select COUNT(CAST(o.created_at AS DATE)) as "orderPendingCount", CAST(o.created_at AS DATE) "date"
            from orders o 
            inner join users u on u.id = o.user_id 
            inner join admin_restaurant_assoc ara on ara.user_id = u.id 
            inner join restaurants r on r.id = ara.restaurant_id  and u.id = ara.user_id 
            where r.id = '${req.query.restaurantId}' AND o.status='${config.item_status.newRequest}' group by CAST(o.created_at AS DATE) order by CAST(o.created_at AS DATE) DESC;`;
            ordersNews = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        }
        res.data = { ordersNews };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

/****
 * 
 * 
 Transfer Item Module
 * 
 * 
 ****/

async function addTransferItem(req, res, next) {
    try {
        let payload = req.body;
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        // Insert Item
        let query = `INSERT INTO transfer_items (id, name, created_at, unit_type) 
        VALUES('${uuidv4()}', '${payload.itemName}', '${nowTime}', '${payload.unitType}');`;
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function updateTransferItem(req, res, next) {
    try {
        let payload = req.body;
        let itemId = req.params.itemId;
        let qryData = [];
        if (payload.itemName) { qryData.push(`name='${payload.itemName}'`) }
        if (payload.unitType) { qryData.push(`unit_type='${payload.unitType}'`) }

        // Update user
        let query = `UPDATE transfer_items SET ${qryData.join(', ')} WHERE id='${itemId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });

        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getTransferItems(req, res, next) {
    try {
        let query = `SELECT i.id "itemId", i.name "itemName", i.created_at "createdAt", i.unit_type "unitType"
        FROM transfer_items i where i.is_deleted = 0 order by i.name ASC;`;
        let transferItems = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        res.data = { transferItems };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function deleteTransferItem(req, res, next) {
    try {
        let itemId = req.params.itemId;
        // Delete user
        let query = `UPDATE transfer_items SET is_deleted = 1 WHERE id='${itemId}';`
        await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.UPDATE });
        res.data = { message: 'deleted successfully' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function addTransferOrder(req, res, next) {
    try {
        let payload = req.body;
        if (payload.transferItems.length) {
            let insertAry = [];
            payload.transferItems.forEach(ele => {
                insertAry.push(`('${uuidv4()}', '${ele.transferItemId}', '${payload.restaurantId}', '${ele.actualQuantity}', now())`)
            });
            // Insert Order        
            let query = `INSERT INTO transfer_order (id, transfer_item_id, restaurant_id, actual_quantity, created_at) VALUES ${insertAry.join(', ')};`
            await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });
        }
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getOrderedTransferItems(req, res, next) {
    try {
        let rId = req.query.restaurantId;
        let query = `SELECT ti.id "itemId", SUM(to2.actual_quantity) "totalStockOut"
        from transfer_items ti
        INNER JOIN transfer_order to2  on to2.transfer_item_id = ti.id
        INNER join restaurants r on to2.restaurant_id = r.id  
        where to2.restaurant_id = '${rId}' GROUP by ti.id ORDER by ti.name ASC`;
        let transferItems = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        let itemIds = transferItems.map(ele => ele.itemId);
        let query2 = `SELECT toit.transfer_item_id  "itemId", SUM(toit.quantity) "totalInStock"
        from transfer_ordered_item_track toit WHERE 
        toit.transfer_item_id in ('${itemIds.join("','")}') AND toit.restaurant_id = '${rId}'
        GROUP by toit.transfer_item_id `
        let transferTrackItems = await sequelize.query(query2, { replacements: [], type: sequelize.QueryTypes.SELECT });


        let query3 = 'SELECT ti.id "itemId", ti.unit_type "unitType", ti.name  FROM transfer_items ti where is_deleted = 0';
        let items = await sequelize.query(query3, { replacements: [], type: sequelize.QueryTypes.SELECT });

        items.map(ele => {
            let data = transferItems.find(x => x.itemId === ele.itemId);
            ele.totalStockOut = (data) ? data.totalStockOut : 0;
            let data2 = transferTrackItems.find(x => x.itemId === ele.itemId);
            if (data) {
                ele.remainingInStock = data.totalStockOut;
                if (data2) {
                    ele.remainingInStock = data.totalStockOut - data2.totalInStock;
                }
            } else {
                ele.remainingInStock = 0;
            }
        });

        res.data = { items };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getStockOut(req, res, next) {
    try {
        let rId = req.query.restaurantId;
        let itemId = req.query.itemId;
        let startDate = `${req.query.startDate} 00:00:00`;
        let endDate = `${req.query.endDate} 23:59:59`;
        let query = `SELECT ti.id "itemId", ti.name "itemName", to2.actual_quantity "stockOut", to2.created_at "date"
        from transfer_order to2 
        INNER JOIN transfer_items ti  on to2.transfer_item_id = ti.id
        INNER join restaurants r on to2.restaurant_id = r.id  
        where to2.restaurant_id = '${rId}' AND ti.id ='${itemId}' 
        AND to2.created_at BETWEEN '${startDate}' AND '${endDate}'
        ORDER by to2.created_at DESC`;
        let stockOut = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        res.data = { stockOut };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getStockConsumed(req, res, next) {
    try {
        let rId = req.query.restaurantId;
        let itemId = req.query.itemId;
        let startDate = `${req.query.startDate} 00:00:00`;
        let endDate = `${req.query.endDate} 23:59:59`;
        let query = `select ti.id "itemId", ti.name "itemName", toit.quantity "stockConsumed", toit.order_date_time "date", u.name  
        FROM transfer_ordered_item_track toit
        INNER JOIN transfer_items ti  on toit.transfer_item_id  = ti.id
        INNER join restaurants r on toit.restaurant_id = r.id  
        INNER join users u on u.id = toit.user_id 
        where toit.restaurant_id = '${rId}' AND ti.id ='${itemId}' 
        AND toit.order_date_time BETWEEN '${startDate}' AND '${endDate}'
        ORDER by toit.order_date_time DESC`;

        let stockOut = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        res.data = { stockOut };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}