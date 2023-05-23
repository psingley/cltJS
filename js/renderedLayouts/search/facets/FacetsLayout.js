define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'app',
	'views/search/facets/FacetView',
	'event.aggregator',
	'views/search/facets/FacetItemView',
	'views/search/facets/FacetRadioItemView',
	'renderedLayouts/search/facets/FacetFeatureLayout',
    'collections/search/facetItems/FacetItemCollection',
	'collections/search/facets/FacetCollection',
	'models/search/facets/FacetModel'
], function ($, _, Backbone, Marionette, App, FacetView, EventAggregator, FacetItemView, FacetRadioItemView, FacetFeatureLayout,FacetItemCollection, FacetCollection, FacetModel) {
	var FacetsLayout = Backbone.Marionette.Layout.extend({
		el: 'body',
		
		initialize: function () {
			//set the scoped variable
			var outerScope = this;

			//loop through each facet and create the necessary regions to render
			//the lists of facet items

			$(".filter[data-facettype]").each(function () {
				var facetId = $(this).attr("id");//$(this).data("facetfield");
				if (!facetId || facetId == "") {
					console.log("Waring Facet Id is null " + $(this).data("facettype"));
				}
				var facetInCollection = outerScope.collection.findWhere({ id: facetId });
				if (facetInCollection) {
					$(this).show();
					outerScope.processingNewFacets(facetInCollection, false, outerScope.collection);
		
				} else {
					if ($(this).data("editormode") == 0) {
						try {
							var defaultVal = JSON.parse($(this).find("input").val());
							// console.log('defaultVal: ', defaultVal)
							var facet = { id: this.id, items: defaultVal, title: $(this).find("label").text() };
							var fc = new FacetModel(facet);														
							//show facet but should be inactive 							
							outerScope.processingNewFacets(fc, true);
						} catch (e) {
							console.log(e);
						}
					} 
				}
			});

			$(window).resize(function () {
				outerScope.getTooltipAction();
			}).resize();

			var target = $('#main');

			//$('.filter-checkbox').click(function() {
			//	$('html,body').animate({
			//		scrollTop: target.offset().top - 75
			//}, 1000);
			//});

		},


		processingNewFacets: function (facet, mustBeDisabled, facets) {
			var outerScope = this;
			var facetType = $('#' + facet.get('id')).data('facettype');
			//to check and add new facet type 
			var facetRegion;
			var facetRegionSelector;
			var facetRegionName;
			if (facetType == 'simpleFacet') {
				var selector = ".filter#" + facet.get('id') + " .facetOptions"
				facetRegionSelector = $(selector); // '#' + facet.get('id') + ' .content .facetRegion';
				facetRegionName = facet.get('id') + 'Region';
				outerScope.regionManager.addRegion(facetRegionName, facetRegionSelector);
				facetRegion = outerScope.regionManager.get(facetRegionName);

				var showToolTip = Boolean($(selector).parent().data("showtooltip"));
				var singleSelect = $('#' + facet.get('id')).data('singleselect');
		
			    //check if this facet has results
				var defaultFacetResults = new FacetItemCollection();//default collection
				try {
					if (facets !== undefined && facet !== undefined) {
						if (facets.get(facet.get('id'))) {
							defaultFacetResults = new FacetItemCollection(facets.get(facet.get('id')).get('items'));
						}
					}
				} catch (e) {
					console.log(e);
				}

				if (singleSelect) {
                    //show view only if results are present
                    if (defaultFacetResults.length > 0) {
                        facetRegion.show(new FacetView({
                            model: facet,
                            itemView: FacetRadioItemView,
                            fieldName: facet.get('id'),
                            showToolTip: showToolTip
                        }));
                    } else {
                        var facetToHide = $('#' + facet.get('id'));
                        facetToHide.hide();
                    }
				} else {
				    if (defaultFacetResults.length > 0) {
				        facetRegion.show(new FacetView({ model: facet, itemView: FacetItemView, showToolTip: showToolTip }));
				    }else {
                        var $facet = $('#' +facet.get('id'));
                        $facet.hide();
                    }
				}
			    //are there any facet Items checked?
				var checked = $(selector + " input:checked").length;
				// yes, continue

				// no, get FacetItems that have 0 in numberRow
				if (checked == 0 || mustBeDisabled) {
					$(selector + ' .filter-results').each(function () {
						if ($(this).text() == '0' || mustBeDisabled) {							
							$(this).closest('label').find('[type=checkbox], [type=radio]').prop("disabled", true);
							$(this).text("");
						}
					});
				} else {
					$(selector + ' .filter-results').each(function () {
						if ($(this).text() === "0") {
							//$(this).closest('label').find('[type=checkbox], [type=radio]').prop("disabled", true);
							$(this).text("");
                        }
					});
				}
			}
			if (facetType == "tourFeatureFacet") {
				var tfSelector = ".filter#" + facet.get('id');
				facetRegionSelector = $(tfSelector);
				facetRegionName = facet.get('id') + 'Region';
				outerScope.regionManager.addRegion(facetRegionName, facetRegionSelector);
				new FacetFeatureLayout({ el: facetRegionSelector, model: facet });//rendered via sitecore										
			}
		},

		getTooltipAction: function () {
			var tooltipIcons = $(".tooltip-icon"),
				closeIcons = $(".tooltip-close");

			if ($(window).width() > 767) {
				tooltipIcons.hover(
				function () {
					$($(this).attr("data-tooltip")).fadeIn(150);
				},
				function () {
					$($(this).attr("data-tooltip")).fadeOut(150);
				}
				);
			}
			else {
				tooltipIcons.unbind();
				tooltipIcons.click(function () {
					$($(this).attr("data-tooltip")).fadeIn(150);
				});

				closeIcons.click(function () {
					$(this).parent().hide();
				});
			}
		}
	});
	return FacetsLayout;
});