var mongoose = require('mongoose');
var Loc = mongoose.model('Locations');

var resJSON = function (res, status, content) {
	res.status(status);
	res.json(content);
};

module.exports.locationsListByDistance = function (req, res) {
	var geoOptions = {
	spherical: true
	//you can add options to this later, such as the maximum number of results, or the maximum distance between the location and the user
	};
	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);
	var point = {
		type: "Point",
		coordinates: [lng, lat]
	};
	if ((!lng && !lng==0) || (!lat && lat !== 0)) {
		resJSON(res, 404, {message: "no lng/lat parameters found in query"});
		return;
	}
	Loc
		.geoNear(point, geoOptions, function(err, results, stats){
			if (err) {
				resJSON(res, 404, err);
			}
			else {
				//for now, I am not processing the data
				//basically, we need to return only the data that interests us
				//we can do this by looping throw the results using the arrays' forEach method
				//we also have to convert the distance from radians to meters
				//for now, let's just return the data as it is 				
				var response = results; //change this later as stated above
				resJSON(res, 200, response); 
			}
		});
};

module.exports.locationsCreate = function (req, res) {
	Loc.create({
			name: req.body.name,
			rating: req.body.rating,
			address: req.body.address,
			tags: req.body.tags.split(","),
			coords: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
		}, function (error, location){
				if (error) {
					resJSON(res, 404, error);
			} else {
					resJSON(res, 200, location);
			}
		});

};

module.exports.locationsReadOne = function (req, res) {
	if (req.params && req.params.locationid ) {
		Loc
			.findById(req.params.locationid)
			.exec(function(err, location){
				if (!location) {resJSON(res, 404, {message: "no location!! id: " + req.params.locationid})}
				else if (err) {resJSON(res, 404, err)}
				else {
					resJSON(res, 200, location);
					console.log("location Reading: success");
				}
				return;
			});
	}
	else {
		resJSON(res, 404, {message: "no locationid found in request"}); return;
	}
};

module.exports.locationsUpdateOne = function (req, res) {
	if (!req.params.locationid) {resJSON(res, 404, {message: "no location id mate"}); return;}
	Loc
		.findById(req.params.locationid)
		.select('-reviews -rating')
		.exec(function (err, location){
			if (!location) {resJSON(res, 404, {message: "no location found"}); return;}
			if (err) {resJSON(res, 404, err); return;}
			location.name = req.body.name;
			location.address = req.body.address;
			location.tags = req.body.tags.split(',');
			location.coords =[parseFloat(req.body.lng), parseFloat(req.body.lat)];
			//you can add opening/closing hours here

			location.save(function(err, location) {
				if (err) { resJSON(res, 404, err); return;}
				console.log("location updated successfully ");
				resJSON(res, 200, location);
			});
		});
};

module.exports.locationsDeleteOne = function (req, res) {
	var id = req.params.locationid;
	if (!id) {resJSON(res, 404, {message: "can you please give me a locationId you shithead"}); return;}
	Loc
		.findByIdAndRemove(id)
		.exec(function (err, location){
			if (err) {
				resJSON(res, 404, err); 
				return;
			}
			console.log("location with name '" + location.id + "' deleted");
			resJSON(res, 204, null);
		});
};