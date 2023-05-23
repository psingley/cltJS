// Filename: views/facets/FacetListView
define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'views/search/facets/FacetItemView',
	'models/search/facets/FacetModel',
	'collections/search/facetItems/FacetItemCollection',
	'models/search/facetItems/FacetItemModel',
	'app',
	'event.aggregator',
	'text!templates/search/facets/tourFeatureTemplate.html',
	'bootstrap',
	'goalsUtil'
], function ($, _, Backbone, Marionette, FacetItemView, FacetModel, FacetItemCollection, FacetItemModel, App, EventAggregator, TourFeatureTemplate, Bootstrap, GoalsUtil) {
	var FacetFeatureLayout = Backbone.Marionette.Layout.extend({
		model: FacetModel,
		template: TourFeatureTemplate,
		events: {
			'change input': 'toggleSearchOption'
		},
		toggleSearchOption: function (e) {
			App.Search.searchOptions.set({ currentPage: 1 });
			EventAggregator.trigger('toggleSearchOption');

			var fieldname = $(e.target).closest('.filter').data('field');
			var value = $(e.target).attr('id');

			if (fieldname != null && value != null) {
				EventAggregator.trigger('searchFilterApplied', fieldname, [value]);
			}

			return true;
		},
		initialize: function () {
			if (this.model.items.length == 0) {
				var $facetGroup = $('#' + this.model.get('id'));
				$facetGroup.hide();
			}

			var searchFacetsResults = this.model.items;

			var staticFacetsJson = $('#' + this.model.get('id') + ' #staticFacetItems').val() || "[]";
			var staticFacetResults = new FacetItemCollection(_($.parseJSON(staticFacetsJson)).map(function(facet) {
				return new FacetItemModel(facet);
			}));

			//We dont want to show empty Facet Items but we specified the Facet Items folder
			if (staticFacetResults.length > 0) {
				var searchFilteredFacetResults = this.filterSearchResults(searchFacetsResults, staticFacetResults);
				var cssFacets = new FacetItemCollection(searchFilteredFacetResults.map(function(searchFacet) {
					var name = searchFacet.get('name');
					var staticFacet = staticFacetResults.find(function(f) {
						return f.get('name') == name;
					});

					if (!staticFacet) {
						return searchFacet.toJSON();
					}
					return _.defaults(searchFacet.toJSON(), staticFacet.toJSON());
				}));

				this.collection = cssFacets;
				this.processingCollection();
				return;
			}

			// No FacetItems folder specified, and we dont want to show empty Facet Items
			this.collection = searchFacetsResults;
			this.processingCollection();
			return;
		},

		processingCollection: function() {
			var lng = this.collection.length;
			//for working faster then $.each that is reqvired for this case
			for (var i = 0; i < lng; i++) {
				var featureData = this.collection.models[i];
				var valueEl = $(this.el).find('span.filter-results[data-feature="' + featureData.get('name') + '"]');
				//$(this.el).find('label.filter-checkbox[data-feature="' + featureData.get('name') + '"] input').map(function () {
				//	$(this).attr('checked', false);
				//});
				var value = featureData.get('count');
				$(valueEl).html(value);
				var isSelected = this.itemViewOptions(featureData);//todo optimize it
				var checkboxList = $(this.el).find('label.filter-checkbox[data-feature="' + featureData.get('name') + '"] input');
				if (isSelected) {
					checkboxList.map(function () {					
						$(this).attr('checked', true);
					});
				} else {
					checkboxList.map(function () {
						$(this).attr('checked', false);
					});
				}

				if (value > 0) {
					$(valueEl).parent().show();
				} else {
					$(valueEl).parent().hide();
				}
				
			}
			this.setTabState();
		},
		
		setTabState: function () {
			document.querySelectorAll(".subfilterbox span.filter-results").forEach((x) => {
				if (x.textContent === "") {
					x.textContent = "0";
					x.parentElement.querySelector('input').disabled = true;
				}

			});

			document.querySelectorAll(".subfilterbox span.filter-checkbox-text").forEach((x) => {
				if (window.location.hash.substr(1).includes(x.textContent.trim())) {
					document.querySelector(`[data-feature=${x.textContent}]`).parentElement.classList.add("show");
				}
			});


		},

		filterSearchResults: function(defaultResults, filteringResults) {
			var filteredFacetResults = new FacetItemCollection(defaultResults.filter(function (defaultFacet) {
				var name = defaultFacet.get('name');
				var staticFacet = filteringResults.find(function (f) {
					return f.get('name') == name;
				});

				return staticFacet;
			}));

			return filteredFacetResults;
		},
		
		itemViewOptions: function (model) {
			var outerScope = this;
			var isChecked = false;

			var parameter = App.Search.searchOptions.get('parameters').find(function (parameter) {
				return parameter.get('id') == outerScope.model.get('id');
			});

			if (parameter !== undefined) {
				var facetItemName = model.get('name');
				var values = parameter.get('values');

				for (var i = 0; i < values.length; i++) {
					var facetItemExists = $.inArray(facetItemName, values);
					if (facetItemExists > -1) {
						isChecked = true;
					}
				}
			}
			return isChecked;

		}
	});
	// Our module now returns our view
	return FacetFeatureLayout;
});
