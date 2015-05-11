'use strict';

// Speakers controller
angular.module('speakers').controller('SpeakersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Speakers',
	function($scope, $stateParams, $location, Authentication, Speakers) {
		$scope.authentication = Authentication;

		// Create new Speaker
		$scope.create = function() {
			// Create new Speaker object
			var speaker = new Speakers ({
				name: this.name
			});

			// Redirect after save
			speaker.$save(function(response) {
				$location.path('speakers/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Speaker
		$scope.remove = function(speaker) {
			if ( speaker ) { 
				speaker.$remove();

				for (var i in $scope.speakers) {
					if ($scope.speakers [i] === speaker) {
						$scope.speakers.splice(i, 1);
					}
				}
			} else {
				$scope.speaker.$remove(function() {
					$location.path('speakers');
				});
			}
		};

		// Update existing Speaker
		$scope.update = function() {
			var speaker = $scope.speaker;

			speaker.$update(function() {
				$location.path('speakers/' + speaker._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Speakers
		$scope.find = function() {
			$scope.speakers = Speakers.query();
		};

		// Find existing Speaker
		$scope.findOne = function() {
			$scope.speaker = Speakers.get({ 
				speakerId: $stateParams.speakerId
			});
		};
	}
]);