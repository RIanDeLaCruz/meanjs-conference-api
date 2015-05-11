'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Speaker = mongoose.model('Speaker'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, speaker;

/**
 * Speaker routes tests
 */
describe('Speaker CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Speaker
		user.save(function() {
			speaker = {
				name: 'Speaker Name'
			};

			done();
		});
	});

	it('should be able to save Speaker instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Speaker
				agent.post('/speakers')
					.send(speaker)
					.expect(200)
					.end(function(speakerSaveErr, speakerSaveRes) {
						// Handle Speaker save error
						if (speakerSaveErr) done(speakerSaveErr);

						// Get a list of Speakers
						agent.get('/speakers')
							.end(function(speakersGetErr, speakersGetRes) {
								// Handle Speaker save error
								if (speakersGetErr) done(speakersGetErr);

								// Get Speakers list
								var speakers = speakersGetRes.body;

								// Set assertions
								(speakers[0].user._id).should.equal(userId);
								(speakers[0].name).should.match('Speaker Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Speaker instance if not logged in', function(done) {
		agent.post('/speakers')
			.send(speaker)
			.expect(401)
			.end(function(speakerSaveErr, speakerSaveRes) {
				// Call the assertion callback
				done(speakerSaveErr);
			});
	});

	it('should not be able to save Speaker instance if no name is provided', function(done) {
		// Invalidate name field
		speaker.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Speaker
				agent.post('/speakers')
					.send(speaker)
					.expect(400)
					.end(function(speakerSaveErr, speakerSaveRes) {
						// Set message assertion
						(speakerSaveRes.body.message).should.match('Please fill Speaker name');
						
						// Handle Speaker save error
						done(speakerSaveErr);
					});
			});
	});

	it('should be able to update Speaker instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Speaker
				agent.post('/speakers')
					.send(speaker)
					.expect(200)
					.end(function(speakerSaveErr, speakerSaveRes) {
						// Handle Speaker save error
						if (speakerSaveErr) done(speakerSaveErr);

						// Update Speaker name
						speaker.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Speaker
						agent.put('/speakers/' + speakerSaveRes.body._id)
							.send(speaker)
							.expect(200)
							.end(function(speakerUpdateErr, speakerUpdateRes) {
								// Handle Speaker update error
								if (speakerUpdateErr) done(speakerUpdateErr);

								// Set assertions
								(speakerUpdateRes.body._id).should.equal(speakerSaveRes.body._id);
								(speakerUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Speakers if not signed in', function(done) {
		// Create new Speaker model instance
		var speakerObj = new Speaker(speaker);

		// Save the Speaker
		speakerObj.save(function() {
			// Request Speakers
			request(app).get('/speakers')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Speaker if not signed in', function(done) {
		// Create new Speaker model instance
		var speakerObj = new Speaker(speaker);

		// Save the Speaker
		speakerObj.save(function() {
			request(app).get('/speakers/' + speakerObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', speaker.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Speaker instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Speaker
				agent.post('/speakers')
					.send(speaker)
					.expect(200)
					.end(function(speakerSaveErr, speakerSaveRes) {
						// Handle Speaker save error
						if (speakerSaveErr) done(speakerSaveErr);

						// Delete existing Speaker
						agent.delete('/speakers/' + speakerSaveRes.body._id)
							.send(speaker)
							.expect(200)
							.end(function(speakerDeleteErr, speakerDeleteRes) {
								// Handle Speaker error error
								if (speakerDeleteErr) done(speakerDeleteErr);

								// Set assertions
								(speakerDeleteRes.body._id).should.equal(speakerSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Speaker instance if not signed in', function(done) {
		// Set Speaker user 
		speaker.user = user;

		// Create new Speaker model instance
		var speakerObj = new Speaker(speaker);

		// Save the Speaker
		speakerObj.save(function() {
			// Try deleting Speaker
			request(app).delete('/speakers/' + speakerObj._id)
			.expect(401)
			.end(function(speakerDeleteErr, speakerDeleteRes) {
				// Set message assertion
				(speakerDeleteRes.body.message).should.match('User is not logged in');

				// Handle Speaker error error
				done(speakerDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Speaker.remove().exec();
		done();
	});
});