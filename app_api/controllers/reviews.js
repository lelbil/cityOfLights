var mongoose = require('mongoose');
var Loc = mongoose.model('Locations'); 

var resJSON = function (res, status, content) {
	res.status(status);
	res.json(content);
};

var setAvg = function(location) {
	var sum = 0; var reviewsLength = location.reviews.length;
	if (!(location.reviews && reviewsLength > 0)) {
		resJSON(res, 404, {message: "reviews array inexistent and/or 0 reviews"});
		return;
	}
	for (var i = 0; i < reviewsLength; i++) {
		sum += location.reviews[i].rating;
	}
	var newRating = parseInt(sum / reviewsLength, 10);
	location.rating = newRating;
	//now we have to save the parent
	//haha that made me imagine the parent drowning and screaming for help
	location.save(function(err){
		if (err) {resJSON(res, 404, err); return;}
		console.log('ida maranich ghalett, tout va bien, average Rating updated to: ', newRating);
	});
};

var updateAvgRating = function (id) {
	Loc
		.findById(id)
		.select('rating reviews')
		.exec(function (err, location){
			if (err) {resJSON(res, 404, err); return;}
			setAvg(location);
		});
};

var doAddReview = function(req, res, location) {
	if (!location) {
		resJSON(res, 404, {message: "how the actual fuck did this happen?!!"}); return;
	}
	var review = {
		author: req.body.name,
		text: req.body.review,
		rating: req.body.rating
	};
	location.reviews.push(review);
	location.save(function (err, location){
		if (err) {resJSON(res, 404, err); return;}
		updateAvgRating(location._id);
		resJSON(res, 201, review);
	});
};


module.exports.reviewsCreate = function(req, res) {
	if (req.params && req.params.locationid ) {
		Loc
			.findById(req.params.locationid)
			.select('reviews')
			.exec(function(err, location){
				if (!location) resJSON(res, 404, {message: "no location!!"});
				else if (err) {resJSON(res, 404, err)}
				else {
					doAddReview(req, res, location);
				}
				return;
			});
	}
	else {
		resJSON(res, 404, {message: "no locationid found in request"}); return;
	}
};
module.exports.reviewsReadOne = function(req, res) {
	if (req.params && req.params.locationid && req.params.reviewid) {
		Loc
			.findById(req.params.locationid)
			.select('name reviews')//what happens if I don't select anything?
			.exec(function(err, location){
				var response, review;
				if (!location) resJSON(res, 404, {message: "no location!!"});
				else if (err) {resJSON(res, 404, err)}
				else {
					//here goes the code for reviews with validations
					if (location.reviews && location.reviews.length > 0) {
						review = location.reviews.id(req.params.reviewid);
						if (!review) resJSON(res, 404, {message: "review not found"});
						else {
							//this is the real deal
							response = {
								location: {
									name: location.name,
									id: req.params.locationid
								}, 
								review: review
							};
							resJSON(res, 200, response);
						}
					}
					else {
						resJSON(res, 404, {message: "no reviewid found in location"}); return;
					}
				}
				return;
			});
	}
	else {
		resJSON(res, 404, {message: "no locationid and/or reviewid found in request"}); return;
	}
};
module.exports.reviewsUpdateOne = function(req, res) {
	if (!req.params.locationid && !req.params.reviewid) {resJSON(res, 404, {message: "no location/review id mate"}); return;}
	Loc
		.findById(req.params.locationid)
		.select('reviews')
		.exec(function (err, location){
			if (!location) {resJSON(res, 404, {message: "no location found"}); return;}
			if (err) {resJSON(res, 404, err); return;}
			if (location.reviews && location.reviews.length > 0) {
				var review = location.reviews.id(req.params.reviewid);
				if (!review ) {resJSON(res, 404, {message: "the review doesn't exist"}); return;}

				//modify this 
				review.author = req.body.author;
				review.text = req.body.text;
				review.rating = req.body.rating;
				//you can add opening/closing hours here

				location.save(function(err, location) {
					if (err) { resJSON(res, 404, err); return;}
					console.log("location updated successfully ");
					updateAvgRating(req.params.locationid); //same as passing location._id???
					resJSON(res, 200, location);
				});
			}
			else {
				resJSON(res, 404, {message: "no reviews for this location"});
			}

			
		});
};
module.exports.reviewsDeleteOne = function(req, res) {
	var locationId = req.params.locationid;
	var reviewId = req.params.reviewid;
	if (!locationId || !reviewId) {resJSON(res, 404, {message: "can you please give me a location/review Id you shithead"}); return;}
	Loc
		.findById(id)
		.exec(function (err, location){
			if (err) {
				resJSON(res, 404, err); 
				return;
			}
			if (!location.reviews || location.reviews.length < 1) {resJSON(res, 404, {message: "no reviews in location"}); return;}
			if (!location.review.id(reviewId)) {resJSON(res, 404, {message: "no review with that ID"}); return;}
			location.reviews.id(reviewId).remove();
			location.save(function (err, location) {
				if (err) {resJSON(res, 404, err); return;}
				console.log("review deleted");
				updateAvgRating(locationid);
				resJSON(res, 204, null);
			});

			
		});
};

