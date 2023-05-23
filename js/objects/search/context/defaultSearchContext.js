define([
'domReady',
'app',
'jquery',
'backbone',
'marionette',
'objects/search/context/baseSearchContext'
],
function (domReady, App, $, Backbone, Marionette, BaseSearchContext) {
	/**
	* @class defaultSearchContext
	* @extends baseSearchContext
	*/
	var defaultSearchContext = (function () {
		var constructor = function () {
			this.onToggleSearchOptions();
			this.onSearchFilterApplied();
			this.onTourDetailOptionClicked();
			this.onRequestResults.apply(this);
			this.onPageLoad.apply(this);
		};

		return constructor;
	})();

	defaultSearchContext.prototype = new BaseSearchContext();
	return defaultSearchContext;
});