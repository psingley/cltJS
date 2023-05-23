define([
'domReady!',
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'collections/search/searchOptions/ParameterCollection',
'models/search/searchOptions/ParameterModel',
'util/objectUtil',
'util/uriUtil',
'goalsUtil',

], function (doc, $, _, Backbone, Marionette, EventAggregator, App, ParameterCollection, ParameterModel, ObjectUtil, UriUtil, GoalsUtil) {
	var BlogTagsFacetLayout = Backbone.Marionette.Layout.extend({
		el: $('.filter'),
		events: {
			'click .blogFacet': 'setFilter'
		},
		initialize: function () {
			var outerScope = this;

			var tagSection = $(".filter.link-list");
			var additionalTagSection = $("#more-tags");

			if ($(additionalTagSection).length > 0 && $(tagSection).length > 0) {
				if ($(additionalTagSection).children().length > 0) {
					$('#toggleMoreTags').show();
				} else if ($(tagSection).children().length <= 0 && $(additionalTagSection).children().length <= 0) {
					$("#textboxFilters").hide();
				}
			}

			/*EventAggregator.on('requestResultsComplete', function (performSearch) {
				$(".filter.link-list").each(function (i, obj) {
					var facetId = $(this).data("fieldname");
					if (facetId == "") {
						console.log("Waring Facet Id is null " + $(this).data("facettype"));
					}
					var facetInCollection = performSearch.get("facets").findWhere({ id: facetId });
					if (facetInCollection) {
						var currentFilter = $('.filter[data-fieldname=' + facetId + ']');

						if (currentFilter.length > 0) {
							var moreTags = $('#more-tags');
							var facetItems = performSearch.get("facets").findWhere({ id: facetId }).get("items");

							if (facetItems.length > 0) {
								$(currentFilter).empty();
								$(moreTags).empty();
								$('#toggleMoreTags').hide();

								for (var facet in facetItems) {
									if (facetItems.hasOwnProperty(facet)) {
										if (facet >= 9) {
											$('#toggleMoreTags').show();
											$(moreTags).append('<li class="blogFacet" data-name="' + facetItems[facet].name + '" data-fieldname="' + facetId + '"><a>' + facetItems[facet].name + '<span class="badge">' + facetItems[facet].count + '</span></a></li>');
										} else {
											$(currentFilter).append('<li class="blogFacet" data-name="' + facetItems[facet].name + '" data-fieldname="' + facetId + '"><a>' + facetItems[facet].name + '<span class="badge">' + facetItems[facet].count + '</span></a></li>');
										}

									}
								}
							}
						}
						$(this).show();
					} else {
						if ($(this).data("editormode") == 0) {
							$(this).hide();
						}
					}
				});
			});*/
		},
		setFilter: function (e, selection) {
			e.stopPropagation();

			var topPage = $('.category-nav');
			if (topPage.length > 0) {
				$('html,body').animate({
					scrollTop: $('.category-nav').offset().top - 50
				}, "slow");
			}

			var target = $(e.currentTarget);
			if (target.length <= 0 || target.val() === undefined) {
				return;
			}

			var filterSelection = target.data('name');
			var filterFieldname = target.data('fieldname');

			var parameterCollection = new ParameterCollection();
			var parameterModel = new ParameterModel({ id: filterFieldname, values: [filterSelection] });
			parameterCollection.push(parameterModel);

			App.Search.searchOptions.set({ currentPage: 1 });
			UriUtil.updateSearchOptionsHash(parameterCollection);
		}
	});

	return BlogTagsFacetLayout;
});