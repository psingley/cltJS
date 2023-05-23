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
	'goalsUtil',
], function ($, _, Backbone, Marionette, FacetItemView, FacetModel, FacetItemCollection, FacetItemModel, App, EventAggregator, GoalsUtil) {
	var FacetView = Backbone.Marionette.CollectionView.extend({
		model: FacetModel,
		events: {
			'click input': 'toggleFacet',
			'change input': 'toggleSearchOption'
		},
		toggleFacet: function (element) {
			//var checkbox = $(element.currentTarget);//$(element.currentTarget).;
			//if (checkbox.is(":disabled")) return;
			//checkbox.prop("checked", !checkbox.prop("checked"));		
		},
		toggleSearchOption: function (e) {
			App.Search.searchOptions.set({ currentPage: 1 });
			EventAggregator.trigger('toggleSearchOption');

			var fieldname = $(e.target).closest('.filter').data('field');
			var value = $(e.target).val();

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
			var staticFacetResults = new FacetItemCollection(_($.parseJSON(staticFacetsJson)).map(function (facet) {
				return new FacetItemModel(facet);
			}));

			//We don't want to show empty Facet Items but we specified the Facet Items folder
			if (staticFacetResults.length > 0) {
				var searchFilteredFacetResults = this.filterSearchResults(searchFacetsResults, staticFacetResults);
				var cssFacets = new FacetItemCollection(searchFilteredFacetResults.map(function (searchFacet) {
					var name = searchFacet.get('name');
					var staticFacet = staticFacetResults.find(function (f) {
						return f.get('name') == name;
					});

					if (!staticFacet) {
						return searchFacet.toJSON();
					}
					return _.defaults(searchFacet.toJSON(), staticFacet.toJSON());
				}));

				//if it is a Feefo Reviews Facet, change the order of the facet in descending order of stars
				this.defineAlternativeName(cssFacets, staticFacetResults);
				this.collection = cssFacets;
				return;
			}

			// No FacetItems folder specified, and we dont want to show empty Facet Items
			//if it is a Feefo Reviews Facet, change the order of the facet in descending order of stars
			this.defineAlternativeName(searchFacetsResults, staticFacetResults);
			this.collection = searchFacetsResults;

			return;
		},
		defineAlternativeName: function (defaultResults, fullResults) {
			defaultResults.forEach(function (item) {
				var name = item.get('name');
				var defItem = fullResults.find(function (f) {
					return f.get('name') == name;
				});

				if (defItem) {
					item.set("alternativeTitle", defItem.get("alternativeTitle"));
				}
			});
		},

		filterSearchResults: function (defaultResults, filteringResults) {
			var filteredFacetResults = new FacetItemCollection(defaultResults.filter(function (defaultFacet) {
				var name = defaultFacet.get('name');
				var staticFacet = filteringResults.find(function (f) {
					return f.get('name') == name;
				});
				if (staticFacet && staticFacet.get('excludeFromFilter')) {
					return undefined;
				}
				 
				return staticFacet;
			}));

			return filteredFacetResults;
		},
		//appendHtml: function (collectionView, itemView) {
		//	var self = this;
		//	// ensure we nest the child list inside of
		//	// the current list item
		//	collectionView.$("div").append(itemView.el);
		//},
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

			return {
				showToolTip: outerScope.options.showToolTip,
				checked: isChecked
			}
		},
		onRender: function () {
			if (this.collection.length == 0) {
				$('#' + this.model.get('id')).hide();
			} else {
				$('#' + this.model.get('id')).show();
			}

			if (document.querySelector("#Popular #stylenamesfacet .facetOptions")) {
				setTimeout(() => {

					document.querySelector("#Popular #stylenamesfacet .facetOptions").querySelectorAll("label").forEach((y) => {

						if (y.classList.contains("explorations")) {
							y.style.display = "block";
						}
						else {
							y.remove();
                        }
					});
				}, "100")
			}
		
			
		}
	});
	// Our module now returns our view
	return FacetView;
});
