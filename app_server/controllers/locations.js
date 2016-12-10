var request = require('request');
var apiOptions = {server:"http://localhost:3000"};
if (process.env.NODE_ENV === 'development') {
	//apiOptions.server = ""; //fill with the produvtion server
}

var renderReviewForm = function (req, res) {
	res.render('location-review-form', {
		title: 'Add a Review',
		pageHeader: {
			title: 'Add a Review'
		}
	});
}

var _showError = function (req, res, status) {
	var title, content;
	if (status === 404) {
		title = "404, page not found";
		content = "Oh dear. Looks like we can't find this page. Sorry.";
	} else {
		title = status + ", something's gone wrong";
		content = "Something, somewhere, has gone just a little bit wrong.";
	}
	res.status(status);
	res.render('generic-text', {
		title: title,
		text: content
	});
};

var getLocationInfo = function (req, res, callback) {
	var path = '/api/locations/' + req.params.locationid;
	var requestOptions = {
		url: apiOptions.server + path,
		method: 'get',
		json : {}
	}
	request(requestOptions, function(err, response, responseBody){
		var data = responseBody;
		if (response.statusCode == 200) { 
			//is this line necessary? does it change anything really? can't remember, too lazy to check 
			data.coords = {lng: responseBody.coords[0],lat: responseBody.coords[1]};
			callback(req, res, data);
		} else {
			_showError(req, res, response.statusCode);
		}
		console.log(data); //delete
	});
}

var renderLocationPage = function (req, res, data) {
	res.render('location-info', {
		title: data.name,
		mapImgURL: 'http://maps.googleapis.com/maps/api/staticmap?center=' + data.coords.lng + ',' + data.coords.lat+ '&zoom=17&size=400x350&sensor=false&markers=48.8583701,2.2944813&scale=2',
		location: data
	});
}

var renderHomePage = function (req, res, data) {
	var message;
	if (!(data instanceof Array)) {
		//data.message? message = data.message :  message = "API error";
		message = "API error" + (data.message? ": " + data.message: "");
		data = [];
	}
	else if (data.length === 0) {
		message = "no locations found nearby";
	}
	res.render('location-list', 
		{
		title: 'City of lights - Home Page',
		pageHeader: { 
			title: 'Paris - City of Lights',
			strapline: 'What to visit when in Paris'
			},
		locations: data,
		message: message
		});
};

var _formatDistance = function(distance) {
	var numDistance, unit;
	if (distance > 1) {
		numDistance = parseFloat(distance).toFixed(1);
		unit = 'km';
	} else {
		numDistance = parseInt(distance * 1000,10);
		unit = 'm';
	}
	return numDistance + unit;
}
module.exports.homeList = function (req, res, next) {
	var path = '/api/locations';
	var requestOptions = {
		url: apiOptions.server + path, //http://localhost:3000/api/locations
		method: "get",
		json: {},
		qs: {
			lng: 2.337235,
			lat: 48.8547029,
			maxDistance: 0.00001 //I think I didn't implement any thing for considering this lolz
		}
	};
	request(requestOptions, function(err, response, body) { //make sure you don't name the response variable in the api call with same name as in the higher function 
		if (err) {console.log(err);}
		var data = body;
		if(response.statusCode = 200 && data.length) {
			for (var i = 0; i < body.length; i++ ){
				data[i].dis = _formatDistance(body[i].dis);
			}
		}
		// console.log(data); //debugging
		renderHomePage(req, res, data);
	});
}

module.exports.locationInfo = function (req, res, next) {
	getLocationInfo(req, res, renderLocationPage);
}

module.exports.addReview = function (req, res, next) {
	renderReviewForm(req, res);
}

module.exports.getTestPage = function (req, res, next) {
	res.render('testPage', {title: 'test page'});
}

module.exports.postTestPage = function(req, res, next) {
	console.log(req.body.name);
	res.redirect('/');
}