'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Speaker = mongoose.model('Speaker'),
	_ = require('lodash');

/**
 * Create a Speaker
 */
exports.create = function(req, res) {
	var speaker = new Speaker(req.body);
	speaker.user = req.user;

	speaker.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(speaker);
		}
	});
};

/**
 * Show the current Speaker
 */
exports.read = function(req, res) {
	res.jsonp(req.speaker);
};

/**
 * Update a Speaker
 */
exports.update = function(req, res) {
	var speaker = req.speaker ;

	speaker = _.extend(speaker , req.body);

	speaker.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(speaker);
		}
	});
};

/**
 * Delete an Speaker
 */
exports.delete = function(req, res) {
	var speaker = req.speaker ;

	speaker.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(speaker);
		}
	});
};

/**
 * List of Speakers
 */
exports.list = function(req, res) { 
	Speaker.find().sort('-created').populate('user', 'displayName').exec(function(err, speakers) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(speakers);
		}
	});
};

/**
 * Speaker middleware
 */
exports.speakerByID = function(req, res, next, id) { 
	Speaker.findById(id).populate('user', 'displayName').exec(function(err, speaker) {
		if (err) return next(err);
		if (! speaker) return next(new Error('Failed to load Speaker ' + id));
		req.speaker = speaker ;
		next();
	});
};

/**
 * Speaker authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.speaker.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
