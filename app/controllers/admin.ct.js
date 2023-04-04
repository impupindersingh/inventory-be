const { sequelize } = require('../models/index');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const momenttz = require('moment-timezone');

module.exports = {
    addOrder,
    getOrder,
    getItemCategory,
    getUsers,
    updateOrderStatus,
    deleteOrder,
    getOrdersAsNews,
    updateInventory,
    getTransferItems
};

// Orders API
async function addOrder(req, res, next) {
    try {
        let payload = req.body;
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        if (payload.length) {
            let insertAry = [];
            payload.forEach(ele => {
                insertAry.push(`('${uuidv4()}', '${ele.itemId}', '${nowTime}', '${ele.quantity}', '${req.loggedInUserObj.userId}', '${config.item_status.newRequest}', '${nowTime}')`)
            });
            // Insert Order        
            let query = `INSERT INTO orders (id, item_id, created_at, quantity, user_id, status, new_request_date) VALUES ${insertAry.join(', ')};`
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
        let startDate = `${req.query.startDate} 00:00:00`;
        let endDate = `${req.query.endDate} 23:59:59`;
        let query = `select o.id "orderId", i.name "itemName", i.unit_type "unitType", c.name "categoryName", o.quantity, u.name, u.id "userId", 
            CAST(o.created_at AS DATE) "createdAt", r.name "restaurantName", r.id "restaurantId", o.status "orderStatus", o.new_request_date "newRequestDate", 
            o.bought_date "boughtDate", o.received_date "receivedDate", o.actual_quantity "receivedQty", o.note_qty "noteReceivedQty"
            from orders o 
            inner join items i on i.id = o.item_id 
            inner join category c on c.id = i.category_id 
            inner join users u on u.id = o.user_id 
            inner join admin_restaurant_assoc ara on ara.user_id = u.id 
            inner join restaurants r on r.id = ara.restaurant_id  and u.id = ara.user_id 
            where u.id = '${userId}' AND o.created_at between '${startDate}' AND '${endDate}' order by (o.status = '${config.item_status.newRequest}') DESC, c.name ASC, i.name ASC`;
        orders = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });
        orders.map(ele => {
            if (ele.orderStatus === config.item_status.newRequest) {
                delete ele.receivedQty;
                delete ele.noteReceivedQty;
            }
        })
        res.data = { orders };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getItemCategory(req, res, next) {
    try {
        // Get Categories
        let catQry = `select c.id "categoryId", c.name "categoryName" from category c where c.is_deleted = 0 order by c.name ASC`;
        let category = await sequelize.query(catQry, { replacements: [], type: sequelize.QueryTypes.SELECT });

        // Get Items
        let itemQry = `select i.id "itemId", i.name "itemName", i.unit_type "itemUnitType", i.category_id "categoryId" from items i where i.is_deleted = 0 order by i.name ASC`;
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

async function updateOrderStatus(req, res, next) {
    try {
        let payload = req.body;
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        if (payload.length) {
            let orderIds = [];
            payload.forEach(ele => {
                (config.item_status.received === ele.status) && orderIds.push(JSON.stringify(ele.orderId))
            });
            // Update Order        
            let query = `UPDATE orders SET status='${config.item_status.received}', received_date='${nowTime}' WHERE 
            id IN (${orderIds.join(',')}) 
            AND status = '${config.item_status.bought}';`
            await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });
        }
        res.data = { message: 'success' };
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
        let userId = req.loggedInUserObj.userId;
        if (userId) {
            let query = `select COUNT(CAST(o.created_at AS DATE)) as "orderPendingCount", CAST(o.created_at AS DATE) "date"
        from orders o 
        inner join users u on u.id = o.user_id 
        where u.id = '${userId}' AND o.status='${config.item_status.newRequest}' group by CAST(o.created_at AS DATE) order by CAST(o.created_at AS DATE) DESC`;
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

async function updateInventory(req, res, next) {
    try {
        let payload = req.body;
        const tz = momenttz().tz('US/Eastern');
        const nowTime = moment(tz.format('YYYY-MM-DD HH:mm:ss')).format('YYYY-MM-DD HH:mm:ss');
        if (payload) {
            let query = `INSERT INTO transfer_ordered_item_track (id, transfer_order_id, quantity, order_date_time) VALUES ('${uuidv4()}', '${payload.transferOrderedItemId}', '${payload.quantity}', '${nowTime}');`
            await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.INSERT });
        }
        res.data = { message: 'success' };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}

async function getTransferItems(req, res, next) {
    try {
        let startDate = `${req.query.date} 00:00:00`;
        let endDate = `${req.query.date} 23:59:59`;
        let rId = req.query.restaurantId;
        let query = `SELECT to2.id, ti.name "itemName", to2.actual_quantity "actualQuantity", toit.quantity "trackQuantity", 
        toit.order_date_time "orderDateTime" from transfer_order to2
        inner join transfer_ordered_item_track toit ON to2.id = toit.transfer_order_id 
        INNER JOIN transfer_items ti on to2.transfer_item_id = ti.id 
        INNER join restaurants r on to2.restaurant_id = r.id 
        where to2.restaurant_id = '${rId}' and to2.created_at between '${startDate}' AND '${endDate}' order by toit.order_date_time DESC`;
        let orders = await sequelize.query(query, { replacements: [], type: sequelize.QueryTypes.SELECT });

        let transferOrders = {};
        orders.forEach(a => {
            if (typeof transferOrders[a.id] === 'undefined') {
                transferOrders[a.id] = {};
                transferOrders[a.id].itemName = a.itemName;
                transferOrders[a.id].actualQuantity = parseInt(a.actualQuantity);
                transferOrders[a.id].totalSold = 0;
                transferOrders[a.id].inventory = [];
            }
            transferOrders[a.id].inventory.push({
                trackQuantity: parseInt(a.trackQuantity),
                orderDateTime: a.orderDateTime
            });
            transferOrders[a.id].totalSold = parseInt(transferOrders[a.id].totalSold) + parseInt(a.trackQuantity)
        });

        let transferItems = Object.keys(transferOrders).map(ele => {
            return transferOrders[ele];
        });
        res.data = { transferItems };
    } catch (error) {
        res.error = { error: (error.response && error.response.data) ? error.response.data : error };
    }
    next();
}