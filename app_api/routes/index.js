var express = require('express');
var router = express.Router();

var routes = require('./locations');
router.use('/', routes);

module.exports = router;