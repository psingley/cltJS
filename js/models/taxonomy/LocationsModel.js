/**
 * Created by ssinno on 10/24/13.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'collections/taxonomy/TaxonomyCollection',
    'models/taxonomy/TaxonomyModel'
], function ($, _, Backbone, TaxonomyCollection, TaxonomyModel) {
	var LocationsModel = Backbone.Model.extend({
		version: "",
        url: function () {
        	var siteName = $('body').data('site');
        	this.version = $('body').data('dicversion');
        	return '/json/' + siteName + '.locations.json?v=' + this.version;;
        },
        parse: function (response) {
	        return response;
        }
    });

    return LocationsModel;
});