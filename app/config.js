
module.exports = {
    dbconnection: {
        //mysql
        username: 'root',
        password: 'root',
        database: 'inventory',
        host: 'localhost',
        dialect: 'mysql',
        port: 3306
    },
    user_roles: {
        admin: 'ADMIN',
        superAdmin: 'SUPER-ADMIN',
    },
    item_units: ['Litre', 'Kilogram', 'Box', 'Bucket', 'Skid', 'Lbs', 'Cans'],
    saltKey: 10,
    jwt: {
        secretKey: 'n*U_hOAT?O4q-7tOH&niC/y?qR#L#]bHB2k:?)qwzFu@5&l,~:s&y`{Df1}c3_<',
        accessExpiryIn: 60 * 60
    }
};
