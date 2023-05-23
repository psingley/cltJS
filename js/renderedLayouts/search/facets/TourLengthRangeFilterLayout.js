define([
'domReady!',
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'renderedLayouts/search/facets/RangeFilterLayout',
'util/objectUtil',
], function (doc, $, _, Backbone, Marionette, EventAggregator, App, RangeFilterLayout,ObjectUtil) {
    var TourLengthRangeFilterLayout = RangeFilterLayout.extend({
		el: $('.filter'),
		initialize: function () {
			var outerScope = this;
			$('.placeholderSlider').hide();
            $("#tourLengthRange #tourLengthError").hide();
            let tourLengthSlider, lengthInputs = "";
            if (!App.isColletteSite) {
                if ($('#tourLengthRange').length <= 0) {
                    return;
                }

                 tourLengthSlider = $('#tourLengthRange').children('.range-slider')[0];
                 lengthInputs = $('#tourLengthRange').find('input.form-control');
            }
            else {
                if ($('.tourLengthRange').length <= 0) {
                    return;
                }

                 tourLengthSlider = $('.tourLengthRange').children('.range-slider')[0];
                 lengthInputs = $('.tourLengthRange').find('input.form-control');
            }


			$('.days-text').on('click', function() {
				$(this).parent().children('input')[0].focus();
			});

            if (App.isColletteSite) {
                this.initSliders(tourLengthSlider, '.tourLengthRange');
            }
            else {
                this.initSliders(tourLengthSlider, '#tourLengthRange');
            }
           

            var updateTourLengthBoxValue = function (min, max) {
                if (!App.isColletteSite) {
                    lengthInputs[0].value = min;
                    lengthInputs[1].value = max;
                    $(lengthInputs[0]).attr("placeholder", min);
                    $(lengthInputs[1]).attr("placeholder", max);
                    }
                }
                      
            EventAggregator.on('requestResultsComplete', function (performSearch) {
                if (!App.isColletteSite) {
                    $("#tourLengthRange #tourLengthError").hide();
                    var resultsMin = performSearch.get('minNumberOfDays');
                    var resultsMax = performSearch.get('maxNumberOfDays');

                    var min = outerScope.sliderMin;
                    if (performSearch.attributes.minNumberOfDays && performSearch.attributes.minNumberOfDays > 0) {
                        min = performSearch.attributes.minNumberOfDays;
                    }

                    var max = outerScope.sliderMax;
                    if (performSearch.attributes.maxNumberOfDays && performSearch.attributes.maxNumberOfDays > 0) {
                        max = performSearch.attributes.maxNumberOfDays;
                    }

                    var searchParams = App.Search.searchOptions.get("parameters");

                    if (!searchParams || searchParams.length <= 0 || (searchParams.length == 1 && searchParams.findWhere({ id: "showFacets" }) != null)) {
                        updateTourLengthBoxValue(min, max);
                    }
                    else {
                        var tourLengthParams = searchParams.findWhere({ id: outerScope.sliderFieldname });
                        if (tourLengthParams && tourLengthParams.get('values').length >= 2) {
                            var filterValues = tourLengthParams.get('values');
                            updateTourLengthBoxValue(filterValues[0], filterValues[1]);
                        } else if (!ObjectUtil.isNullOrEmpty(resultsMin) && !ObjectUtil.isNullOrEmpty(resultsMax) && resultsMin != 0 && resultsMax != 0) {
                            updateTourLengthBoxValue(resultsMin, resultsMax);
                        }
                    }
                }
                else {

                    App.tourLengthDescriptionResults.forEach((facet) => {

                        if (facet.attributes.title === "Tour Length Description") {
                            document.getElementById("filter-zero").textContent = "0";
                            document.getElementById("filterweek").disabled = true;
                            document.getElementById("filter-one").textContent = "0";
                            document.getElementById("filter2week").disabled = true;
                            document.getElementById("filter-two").textContent = "0";
                            document.getElementById("filter3week").disabled = true;

                            facet.items.forEach((c) => {
                                /*console.log(c.attributes.name, c.attributes.count)*/
                                if (c.attributes.name === "Up to 1 week") {
                                    document.getElementById("filterweek").disabled = false;
                                    document.getElementById("filter-zero").textContent = c.attributes.count;
                                }
                                if (c.attributes.name === "1-2 weeks") {
                                    document.getElementById("filter2week").disabled = false;
                                    document.getElementById("filter-one").textContent = c.attributes.count;
                                }
                                if (c.attributes.name === "2 weeks +") {
                                    document.getElementById("filter3week").disabled = false;
                                    document.getElementById("filter-two").textContent = c.attributes.count;
                                }
                            });
                        }
                    });
                }
			});
		}
	});
	
	return TourLengthRangeFilterLayout;
});