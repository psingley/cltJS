// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/general/StateModel',
    'util/objectUtil'
], function (_, Backbone, StateModel, ObjectUtil) {
	var StatesCollection = Backbone.Collection.extend({
		model: StateModel,
		countryId:'',
		url: "/Services/Taxonomy/TaxonomyService.asmx/GetStatesForLocation",
		initialize: function (options) {
			options || (options = {});
			this.countryId = options.countryId;
		},
		parse: function (response) {
		    var data = $.parseJSON(response.d);
			return _(data).map(function (state) {
				return state ;
			});
		},
		fetch: function () {
		    var options = {};
			options.data=JSON.stringify({ id: this.countryId });
			options.cache = true;
			options.type = "POST";
			options.contentType = "application/json; charset=utf-8";
			options.dataType = "json";
			options.success = this.fetchSuccess;
			options.error = this.fetchError;
			return Backbone.Collection.prototype.fetch.call(this, options);
		},
		fetchSuccess: function (collection, response) {
		   
		    if (!ObjectUtil.isNullOrEmpty(sessionStorage)) {

		        sessionStorage.setItem('countryStatesSessionCache', JSON.stringify({ 'countryId': collection.countryId, 'states': response.d }));
		    }
		    
		   
		},
		fetchError: function (collection, response) {
		    console.log('could not get states for country:' + collection.countryId);
			console.log(response);
		},
		outerScope : this
	});
	// Return the model for the module
	return StatesCollection;
});