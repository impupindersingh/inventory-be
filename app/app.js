//express
const express = require('express');
const app = express();
//modules
const fs = require('fs');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
//middleware
const { globalErrorHandler } = require('./middleware/error-handler.mw');

//configs - to be moved
const appPrefix = '/inventory/';
const port = process.env.PORT || '5858';

//cors
app.use(cors());
//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1024MB' }));

//routes
fs.readdirSync('./app/routes').forEach((file) => {
    if (file.substr(-3) == '.js') {
        // eslint-disable-next-line global-require
        let route = require('./routes/' + file);
        let routeName = file.slice(0, -6);
        app.use(appPrefix + routeName, route);
        route.stack.forEach(route => {
            let routePath = route.route.path;
            let routeMethod = route.route.methods;
            console.log([routeMethod, appPrefix + routeName + routePath]);
        });
    }
});

//celebrate validator
app.use(errors());
//error handler
app.use(globalErrorHandler);
//swagger
const swaggerDefinition = {
    info: {
        title: 'Inventory Management API',
        version: '1.0.0',
        description: 'Spec for Swagger'
    },
    host: process.env.host || 'localhost:5858',
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            schema: 'Bearer',
            in: 'header'
        }
    }
};

const swaggerOptions = {
    swaggerDefinition,
    apis: ['./app/routes/*.rt.js']
};
const specs = swaggerJsdoc(swaggerOptions);
specs.basePath = appPrefix;
app.use('/inventory/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
//listener
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/dev/index.html');
});
