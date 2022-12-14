const express = require('express');
const bodyParser = require('body-parser');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerJsDoc = YAML.load('./documentation/api.yaml');
const index = require('./routes/index');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', index);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc));

module.exports = app;