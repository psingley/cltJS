
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/search/facets/ActiveFiltersItemView',
    'app',
    'collections/search/facets/ActiveFiltersCollection',
    'event.aggregator',
    'text!templates/search/activeFiltersListTemplate.html'
], function ($, _, Backbone, Marionette, ActiveFiltersItemView, App, ActiveFiltersCollection, EventAggregator, ActiveFiltersListTemplate) {
	var ActiveFiltersListView = Backbone.Marionette.CompositeView.extend({
		collection: ActiveFiltersCollection,
		itemView: ActiveFiltersItemView,
		tagName: "ul",
		className: "filter-set-filters",
		template: Backbone.Marionette.TemplateCache.get(ActiveFiltersListTemplate),
		events: {
			'click li .activeFilterItem': 'removeFilterItem'
		},
		initialize: function () {
            var outerScope = this;            
		}
	});
	return ActiveFiltersListView;
});
