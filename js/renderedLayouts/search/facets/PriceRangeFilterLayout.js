define([
'domReady!',
'jquery',
'underscore',
'backbone',
'marionette',
'event.aggregator',
'app',
'renderedLayouts/search/facets/RangeFilterLayout',
'renderedLayouts/search/facets/SharedRangeFilterLayout',
'util/objectUtil',
], function (doc, $, _, Backbone, Marionette, EventAggregator, App, RangeFilterLayout, SharedRangeFilterLayout, ObjectUtil) {
    var PriceRangeFilterLayout = RangeFilterLayout.extend({
		el: $('.filter'),
		initialize: function () {
			var outerScope = this;
            $('.placeholderSlider').hide();
            $("#priceRangeFilter #priceRangeError").hide();
			if ($('#priceRangeFilter').length <= 0) {
				return;
			}

            this.setCurrencyInputSymbols($('#priceRangeFilter').find(".currency-input"));
                        
            var updateCurrencyBoxValue = function (resultsMin, resultsMax) {
                localStorage.minxy = resultsMin;
                localStorage.maxy = resultsMax;
                outerScope.updatePriceRange(resultsMin, resultsMax);
            }
            
			EventAggregator.on('requestResultsComplete', function (performSearch) {
                $("#priceRangeFilter #priceRangeError").hide();
                var resultsMin = performSearch.get('minPrice');
                var resultsMax = performSearch.get('maxPrice');

                var min = outerScope.sliderMin;
                if (performSearch.attributes.minPrice && performSearch.attributes.minPrice > 0) {
                    min = Math.floor(performSearch.attributes.minPrice / 100.0) * 100;
                }
                
                var max = outerScope.sliderMax;
                if (performSearch.attributes.maxPrice && performSearch.attributes.maxPrice > 0) {
                    max = Math.ceil(performSearch.attributes.maxPrice / 100.0) * 100;
                }
                
				var searchParams = App.Search.searchOptions.get("parameters");
                if (!searchParams || searchParams.length <= 0 || (searchParams.length == 1 && searchParams.findWhere({ id: "showFacets" }) != null)) {
                    updateCurrencyBoxValue(resultsMin, resultsMax);
                } else {
                    var priceRangeParams = searchParams.findWhere({ id: outerScope.sliderFieldname });
                    if (priceRangeParams && priceRangeParams.get('values').length >= 2) {
                        var filterValues = priceRangeParams.get('values');  
                         // On Site selection change, we need to effect the placeholder and the Price value. 
                        updateCurrencyBoxValue(filterValues[0], filterValues[1]);                       
                       // console.log("PriceRangeFilter1", filterValues[0], filterValues[1]);
                    }
                    else if (!ObjectUtil.isNullOrEmpty(resultsMin) && !ObjectUtil.isNullOrEmpty(resultsMax) && resultsMin != 0 && resultsMax != 0) {
                        var minimumPrice = Math.floor(resultsMin / 100.0) * 100;
                        var maximumPrice = Math.ceil(resultsMax / 100.0) * 100;                        
                        updateCurrencyBoxValue(minimumPrice, maximumPrice);
                    }
                }
                if (App.isColletteSite) {
                    outerScope.updatePriceRange(resultsMin, resultsMax);
                }
			});			
		},

        updatePriceRange: function (resultsMin, resultsMax) {
            if (App.isColletteSite) {
                var minSlider = document.getElementById('min');
                var maxSlider = document.getElementById('max');
                var outputMin = document.getElementById('min-value');
                var outputMax = document.getElementById('max-value');

                outputMin.value = minSlider.value;
                outputMax.value = maxSlider.value;

                minSlider.oninput = function () {
                    outputMin.value = this.value;
                }

                maxSlider.oninput = function () {
                    outputMax.value = this.value;
                }

                minSlider.min = resultsMin;
                minSlider.max = resultsMax;
                minSlider.value = resultsMin;
                maxSlider.min = resultsMin == resultsMax ? 0 : resultsMin;
                maxSlider.max = resultsMax;
                maxSlider.value = resultsMax;

                outputMin.value = resultsMin;
                outputMax.value = resultsMax;
            }
            else {
                var priceInputs = $('#priceRangeFilter').find('input.form-control');
                $(priceInputs[0]).attr("placeholder", resultsMin);
                $(priceInputs[1]).attr("placeholder", resultsMax);
			}
        },


		setCurrencyInputSymbols: function (currencyInputElements) {
			var faPrefix = 'fa-';
			var siteCurrency = App.siteSettings.currencyClass;
			if (!siteCurrency || siteCurrency.length <= 0) {
				siteCurrency = "dollar";
			}

			var index = siteCurrency.indexOf(faPrefix);
			var currencySymbol = index >= 0 ? siteCurrency.substring(index + faPrefix.length) : siteCurrency;

			currencyInputElements.attr('class', 'currency-input ' + currencySymbol);
		},
	});

	return PriceRangeFilterLayout;
});