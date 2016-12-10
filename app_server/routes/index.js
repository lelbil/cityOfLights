var express = require('express');
var router = express.Router();

var ctrlLocations = require('../controllers/locations');
var ctrlOthers = require('../controllers/others');

/* GET locations pages */
router.get('/', ctrlLocations.homeList);
router.get('/location/:locationid', ctrlLocations.locationInfo);
router.get('/location/:locationid/reviews/new', ctrlLocations.addReview);

/*GET other pages */
router.get('/about', ctrlOthers.about);

/*Get test Page*/
router.get('/testPage', ctrlLocations.getTestPage);
router.post('/testPage', ctrlLocations.postTestPage);

module.exports = router;
