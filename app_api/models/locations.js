var mongoose = require('mongoose');

var scheduleSchema = new mongoose.Schema({
	days: {type: String, required: true},
	opens: String,
	closes: String,
	open: {type: Boolean, required: true}
});

var reviewSchema = new mongoose.Schema({
	author: String,
	text: String,
	rating: {type: Number, min:0, max:5, required: true},
	createdOn: {type: Date, "default": Date.now}
});

var locationSchema = new mongoose.Schema({
	name: {type: String, required: true},
	rating: {type: Number, "default": 0, min: 0, max: 5},
	address: String,
	tags: [String],
	coords: {type: [Number], index: '2dsphere'},
	schedule: [scheduleSchema],
	reviews: [reviewSchema],
	photos: [String]
});

//creating the model
var Location = module.exports = mongoose.model('Locations', locationSchema);

//can I use this from db.js without exporting it?
//since db.js is requiring this file
module.exports.createLocation = function (newLocation, callback) {
	newLocation.save(callback);
};