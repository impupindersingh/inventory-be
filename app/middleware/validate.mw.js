const { celebrate, Joi } = require('celebrate');
const config = require('../config');

let authenticationValidator = celebrate({
    body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required(),
        type: Joi.string().required().valid(config.user_roles.admin, config.user_roles.superAdmin)
    })
});

let addUserValidator = celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().allow('').optional(),
        assignedRestaurantId: Joi.string().required()
    })
});

let updateUserValidator = celebrate({
    body: Joi.object().keys({
        name: Joi.string().optional(),
        email: Joi.string().optional(),
        password: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zip: Joi.string().optional(),
        addressLine1: Joi.string().optional(),
        addressLine2: Joi.string().allow('').optional(),
        assignedRestaurantId: Joi.string().optional()
    })
});

let addCatValidator = celebrate({
    body: Joi.object().keys({
        categoryName: Joi.string().required(),
    })
});

let addRestaurantValidator = celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        zip: Joi.string().required(),
        country: Joi.string().required(),
        addressLine1: Joi.string().required(),
        addressLine2: Joi.string().allow('').optional()
    })
});

let updateRestaurantValidator = celebrate({
    body: Joi.object().keys({
        name: Joi.string().optional(),
        phoneNumber: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        zip: Joi.string().optional(),
        country: Joi.string().optional(),
        addressLine1: Joi.string().optional(),
        addressLine2: Joi.string().allow('').optional()
    })
});

let addItemValidator = celebrate({
    body: Joi.object().keys({
        itemName: Joi.string().required(),
        categoryId: Joi.string().required(),
        description: Joi.string().optional(),
        unitType: Joi.string().required().valid(config.item_units)
    })
});

let updateItemValidator = celebrate({
    body: Joi.object().keys({
        itemName: Joi.string().optional(),
        categoryId: Joi.string().optional(),
        description: Joi.string().optional(),
        unitType: Joi.string().optional().valid(config.item_units)
    })
});

let addOrderValidator = celebrate({
    body: Joi.array().items({
        itemId: Joi.string().required(),
        quantity: Joi.string().required()
    })
});

let updateSuperUserValidator = celebrate({
    body: Joi.object().keys({
        password: Joi.string().optional(),
        email: Joi.string().optional()
    })
});

let updateOrderStatusValidator = celebrate({
    body: Joi.array().items({
        orderId: Joi.string().required(),
        status: Joi.string().required().valid(config.item_status.received)
    })
});

let getOrderValidator = celebrate({
    query: Joi.object().keys({
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        userId: Joi.string().optional(),
        restaurantId: Joi.string().optional(),
    })
});

let updateSAOrderStatusValidator = celebrate({
    body: Joi.array().items({
        orderId: Joi.string().required(),
        status: Joi.string().required().valid(config.item_status.bought),
        acceptedQty: Joi.string().required(),
        note: Joi.string().optional(),
    })
});

let getItemHistoryValidator = celebrate({
    query: Joi.object().keys({
        restaurantId: Joi.string().required(),
        items: Joi.string().required()
    })
});

let addTransferItemValidator = celebrate({
    body: Joi.object().keys({
        itemName: Joi.string().required(),
        unitType: Joi.string().required().valid(config.item_units)
    })
});

let updateTransferItemValidator = celebrate({
    body: Joi.object().keys({
        itemName: Joi.string().optional(),
        unitType: Joi.string().optional().valid(config.item_units)
    })
});

let addTransferOrderValidator = celebrate({
    body: Joi.object().keys({
        restaurantId: Joi.string().required(),
        transferItems: Joi.array().items({
            transferItemId: Joi.string().required(),
            actualQuantity: Joi.string().required()
        }).min(1).required(),
    })
});

let updateInventoryValidator = celebrate({
    body: Joi.object().keys({
        itemId: Joi.string().required(),
        quantity: Joi.string().required(),
        restaurantId: Joi.string().required()
    })
});

module.exports = {
    authenticationValidator,
    addUserValidator,
    updateUserValidator,
    addCatValidator,
    addRestaurantValidator,
    updateRestaurantValidator,
    addItemValidator,
    updateItemValidator,
    addOrderValidator,
    updateSuperUserValidator,
    updateOrderStatusValidator,
    getOrderValidator,
    updateSAOrderStatusValidator,
    getItemHistoryValidator,
    addTransferItemValidator,
    updateTransferItemValidator,
    addTransferOrderValidator,
    updateInventoryValidator
};
