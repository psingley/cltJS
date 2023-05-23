define([
    'jquery',
    'underscore',
    'models/taxonomy/LocationsOnAddressesModel',
    'event.aggregator',
    'util/objectUtil'
], function ($, _, LocationsOnAddressesModel, EventAggregator, ObjectUtil) {
	var locationsOnAddressesUtil = (function () {

		//constructor
		var constructor = function () {
			//private instance variables.
			var _locations = new LocationsOnAddressesModel();

			var deferred = $.Deferred(function (defer) {
				_locations.fetch({
					type: "GET",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					cache: true,
					success: function (response) {
						defer.resolve();
					},
					error: function (errorResponse) {
						console.log("Inside Failure");
						console.log(errorResponse.responseText);
						defer.resolve();
					}
				});
			});

			this.getLocations = function () {
				return deferred.promise();
			};

			//gets all of the locations for a specific type
			this.getAll = function (type) {
				var locations = _locations.get(type);

				if (ObjectUtil.isNullOrEmpty(locations)) {
					console.log('the locations object was not returned back from the request');
					return null;
				}

				if (locations.length == 0) {
					console.log('there were no locations returned');
					return null;
				}

				return locations;
			};

			this.getLocationOnAddressesItemById = function (id) {
				var allTaxonomies = [];
				for (var taxonomyType in _locations.attributes) {
					var taxonomyTypeObject = _locations.attributes[taxonomyType];
					for (var taxonomy in taxonomyTypeObject) {
						allTaxonomies.push(taxonomyTypeObject[taxonomy]);
					}
				}

				var taxonomyObject = _.find(allTaxonomies, function (taxonomy) {
					return taxonomy.id === id;
				});

				if (taxonomyObject != undefined) {
					return taxonomyObject;
				}

				console.log('could not find taxonomy for id ' + id);
				return null;
			};

			this.getCountriesForAddressesLocation = function (id) {
				var countriesRequest = $.ajax({
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					url: '/Services/Taxonomy/TaxonomyService.asmx/GetCountriesForAddressesLocation',
					data: id,
					cache: true,
					success: function (response) {
					},
					error: function (errorResponse) {
						console.log("Inside Failure");
						console.log(errorResponse.responseText);
					}
				});

				return countriesRequest;
			};

			this.getStatesForAddressesLocation = function (id) {
				var statesRequest = $.ajax({
					type: "POST",
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					url: '/Services/Taxonomy/TaxonomyService.asmx/GetStatesForAddressesLocation',
					data: JSON.stringify({ id: id }),
					cache: true,
					success: function (response) {
					},
					error: function (errorResponse) {
						console.log("Inside Failure");
						console.log(errorResponse.responseText);
					}
				});

				return statesRequest;
			};

			var getLocation = function (type, key) {
				var locationType = _locations.get(type);

				if (ObjectUtil.isNullOrEmpty(locationType)) {
					console.log('could not find the location item ' + key);
					return '';
				}

				var location = null;
				if (!ObjectUtil.isNullOrEmpty(key)) {
					location = _.filter(locationType, function (location) {
						return location.name.toLocaleLowerCase() === key.toLowerCase();
					});
				}

				if (ObjectUtil.isNullOrEmpty(location)) {
					return '';
				}

				if (location.length > 1) {
					console.log('location key returned too many results');
					return '';
				}

				if (location.length == 0) {
					console.log('could not find the location ' + type);
					return '';
				}

				return location[0];
			};

			this.getLocationItem = function (type, key) {
				var location = getLocation(type, key);

				if (!ObjectUtil.isNullOrEmpty(location)) {
					return location;
				}

				return null;
			};

			this.getLocationId = function (type, key) {
				var location = getLocation(type, key);

				if (ObjectUtil.isNullOrEmpty(location)) {
					console.log('location is null');
					return null;
				}

				return location.id;
			};
		};

		return constructor;
	})();

	return locationsOnAddressesUtil;
});