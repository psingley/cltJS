// Filename: collections/projects
define([
    'underscore',
    'backbone',
    'app',
    'util/dateUtil'
], function(_, Backbone, App, DateUtil) {
	var DictionaryModel = Backbone.Model.extend({
		version: DateUtil.getYYYYMMDD(new Date()),
    	url: function () {
    		var siteName = $('body').data('site');
    		this.version = $('body').data('dicversion');
    		var url = '/json/' + siteName + '.dictionary.json?v=' + this.version;
    		return url;
    	},
    	parse: function (response) {
    		return response;
    	}
    });
    // You don't usually return a collection instantiated
    return DictionaryModel;
});
