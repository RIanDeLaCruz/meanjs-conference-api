'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var speakers = require('../../app/controllers/speakers.server.controller');

	// Speakers Routes
	app.route('/speakers')
		.get(speakers.list)
		.post(users.requiresLogin, speakers.create);

	app.route('/speakers/:speakerId')
		.get(speakers.read)
		.put(users.requiresLogin, speakers.hasAuthorization, speakers.update)
		.delete(users.requiresLogin, speakers.hasAuthorization, speakers.delete);

	// Finish by binding the Speaker middleware
	app.param('speakerId', speakers.speakerByID);
};
