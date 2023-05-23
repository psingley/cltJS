/**
 * Created by ssinno on 10/24/13.
 */
define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
	var TaxonomyModel = Backbone.Model.extend({
		version: "",
    	url: function () {
    		var siteName = $('body').data('site');
    		this.version = $('body').data('dicversion');
    		return '/json/' + siteName + '.taxonomy.json?v=' + this.version;;
    	},
    	parse: function (response) {
    		return response;
    	}
    });

    return TaxonomyModel;
});