define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/search/activeFiltersItemTemplate.html',
	'app',
	'models/search/ActiveFilterItemModel',
	'util/stringUtil'
], function ($, _, Backbone, Marionnette, activeFiltersItemTemplate, App, ActiveFilterItemModel, StringUtil) {
	var ActiveFiltersItemView = Backbone.Marionette.ItemView.extend({
		model: ActiveFilterItemModel,
		tagName: 'li',
		className: 'activeFilterItem',
		template: Backbone.Marionette.TemplateCache.get(activeFiltersItemTemplate),
		initialize: function (options) {
			this.checked = options.checked;
			
		},
		templateHelpers: function () {
			return {
				getFilterTitleProtected: function() {
					if (this.filtertitle) {
						return StringUtil.protectSpecialSymbols(this.filtertitle);
					} else {
						return this.filtertitle;
					}
				},
				isStarsFacet: function() {
					if (this.fieldname === 'stars') {
						return true;
					}
					return false;
				}
			};
		}
	});

	// Our module now returns our view
	return ActiveFiltersItemView;
});
