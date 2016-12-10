var express = require('express');
var router = express.Router();

// I think the three lines below are not necessary here and have to be only in the controler
var multer = require('multer');
var upload = multer({dest: './public/photos'});
var expressValidator = require('express-validator');

var admin = require('../controllers/admin');

router.get('/addLocation', admin.newLocationForm);
//router.post('/addLocation', upload.single('photo') , admin.submitToDB);
router.post('/addLocation', upload.array('photo') ,admin.submitToDB);


module.exports = router;