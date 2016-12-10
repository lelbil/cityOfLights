
var multer = require('multer');
var upload = multer({dest: './public/photos'});
var expressValidator = require('express-validator');

var Location = require('../../app_api/models/locations');

module.exports.newLocationForm = function (req, res, next) {
	res.render('addLocation', {title: 'add a new location'});
}

module.exports.submitToDB = function (req, res) {
	var name = req.body.name;
	var rating = req.body.rating;
	var address = req.body.address;
	var tags = req.body.tags.split(",");
	var latitude = parseFloat(req.body.latitude);
	var longitude = parseFloat(req.body.longitude);
	
	console.log(req.body);
	console.log("what about images?");
	console.log(req.files);

	//validating data
	req.checkBody('name', 'name is required').notEmpty();
	req.checkBody('address','address is required').notEmpty();

	var errors = req.validationErrors(); 

	if(errors) {
		console.log("Wohoooo hold on there mate, there are some errors");
		console.log(errors);
		res.render('addLocation', {errors: errors});
	} else {
		var newLoc = new Location({
			name: name,
			rating: rating,
			address: address,
			tags: tags,
			coords: [latitude, longitude] //order, order, order in the courtroom 
		});
		Location.createLocation(newLoc, function(err, loc){
			if (err) throw err;
			console.log(loc);
		});
	}


	//don't touch the line below please LOLZ
	res.redirect('/admin/addLocation');

}