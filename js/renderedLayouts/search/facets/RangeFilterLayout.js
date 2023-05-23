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
    'util/uriUtil',
    'util/objectUtil',
    'util/searchOptionsUtil'
], function (doc, $, _, Backbone, Marionette, EventAggregator, App, ParameterCollection, ParameterModel, UriUtil, ObjectUtil, SearchOptionsUtil) {
    var RangeFilterLayout = Backbone.Marionette.Layout.extend({
        initSliders: function (rangeSlider, id) {
            var outerScope = this;
            if (App.isColletteSite) {
                let tid = ".tourLengthRange";
                const minSlider = document.getElementById('min');
                const maxSlider = document.getElementById('max');
                const minPrice = document.getElementById('min-value');
                const maxPrice = document.getElementById('max-value');
                $("#filterweek").on("click", () => { outerScope.runSearch(tid, "Up to 1 week", ""); });
                $("#filter2week").on("click", () => { outerScope.runSearch(tid, "1-2 weeks", ""); });
                $("#filter3week").on("click", () => { outerScope.runSearch(tid, "2 weeks +", ""); });

                minPrice.addEventListener('blur', (flag) => {
                    $("#priceRangeFilter #priceRangeError").hide();
                    if (parseInt(minPrice.value) < parseInt(maxPrice.value)) {
                        outerScope.runSearch("price", minPrice.value, maxPrice.value);
                    }
                    else {
                        minPrice.value = document.getElementById('max').value;
                        $("#priceRangeFilter #priceRangeError").text("Must be greater than minimum price.");
                        $("#priceRangeFilter #priceRangeError").show();
                    }
                });

                minSlider.addEventListener('mouseup', (flag) => {
                    $("#priceRangeFilter #priceRangeError").hide();
                    if (parseInt(minPrice.value) < parseInt(maxPrice.value)) {
                        outerScope.runSearch("price", minPrice.value, maxPrice.value);
                    }
                    else {
                        minPrice.value = document.getElementById('max').value;
                        $("#priceRangeFilter #priceRangeError").text("Must be greater than minimum price.");
                        $("#priceRangeFilter #priceRangeError").show();
                    }
                });
                maxPrice.addEventListener('blur', () => {
                    $("#priceRangeFilter #priceRangeError").hide();
                    if (parseInt(minPrice.value) < parseInt(maxPrice.value)) {
                        outerScope.runSearch("price", minPrice.value, maxPrice.value);
                    }
                    else {
                        maxPrice.value = document.getElementById('min').value;;
                        $("#priceRangeFilter #priceRangeError").text("Must be less than maximum price.");
                        $("#priceRangeFilter #priceRangeError").show();
                    }
                });
                maxSlider.addEventListener('mouseup', () => {
                    $("#priceRangeFilter #priceRangeError").hide();
                    if (parseInt(minPrice.value) < parseInt(maxPrice.value)) {
                        outerScope.runSearch("price", minPrice.value, maxPrice.value);
                    }
                    else {
                        maxPrice.value = document.getElementById('min').value;
                        $("#priceRangeFilter #priceRangeError").text("Must be less than maximum price.");
                        $("#priceRangeFilter #priceRangeError").show();
                    }
                });
            }
            else {
                var minInput = $(rangeSlider).find(".slider-min-input")[0];
                var maxInput = $(rangeSlider).find(".slider-max-input")[0];
                var minInputCopy = null;
                var maxInputCopy = null;

                this.sliderFieldname = $(id).data('fieldname');
                this.sliderMin = parseInt($(rangeSlider).data("min"));
                this.sliderMax = parseInt($(rangeSlider).data("max"));
                this.sliderStep = parseInt($(rangeSlider).data("step"));
                minInput.addEventListener('change', function () {
                    minInput.value = minInput.value < 0 ? -1 * (minInput.value) : minInput.value;
                    minInput.placeholder = minInputCopy.placeholder;
                    minInputCopy = minInput.cloneNode(true);
                    onInputChange(false);
                });
                maxInput.addEventListener('change', function () {
                    maxInput.value = maxInput.value < 0 ? -1 * (maxInput.value) : maxInput.value;
                    maxInput.placeholder = maxInputCopy.placeholder;
                    maxInputCopy = maxInput.cloneNode(true);
                    onInputChange(true);
                });

                maxInput.onclick = function () {
                    if (!(ObjectUtil.isNullOrEmpty(maxInput.value) || ObjectUtil.isNullOrEmpty(maxInput.placeholder)))
                        maxInputCopy = maxInput.cloneNode(true);
                    maxInput.value = '';
                    maxInput.placeholder = '';
                };
                minInput.onclick = function () {
                    if (!(ObjectUtil.isNullOrEmpty(minInput.value) || ObjectUtil.isNullOrEmpty(minInput.placeholder)))
                        minInputCopy = minInput.cloneNode(true);
                    minInput.value = '';
                    minInput.placeholder = '';
                };
                maxInput.onblur = function () {
                    maxInput.value = (ObjectUtil.isNullOrEmpty(maxInput.value)) ? maxInputCopy.value : maxInput.value;
                    maxInput.placeholder = (ObjectUtil.isNullOrEmpty(maxInput.placeholder)) ? maxInputCopy.placeholder : maxInput.placeholder;
                };
                minInput.onblur = function () {
                    minInput.value = (ObjectUtil.isNullOrEmpty(minInput.value)) ? minInputCopy.value : minInput.value;
                    minInput.placeholder = (ObjectUtil.isNullOrEmpty(minInput.placeholder)) ? minInputCopy.placeholder : minInput.placeholder;
                };
            }

         

            EventAggregator.on("setDefaultInputValue", function (params) {
                minInputCopy = null;
                maxInputCopy = null;
            });
		},

        runSearch: function (id, min, max) {
            if (id === ".tourLengthRange") {
                this.applyTourLengthRangeFilter(min, "tourlength_description");
            }
            else {
                this.applyFilter(min, max, id);
            }
            EventAggregator.trigger('searchFilterApplied', $(id).data('fieldname'), [min, max]);
        },

        applyFilter: function (minVal, maxVal, fieldnameVal) {
            var searchOptionsParams = App.Search.searchOptions.get('parameters');
            var parameterModel;

            if (searchOptionsParams.length <= 0) {
                var parameterCollection = new ParameterCollection();
                parameterModel = new ParameterModel({ id: fieldnameVal, values: [] });
                parameterModel.get("values").push(minVal);
                parameterModel.get("values").push(maxVal);
                parameterCollection.push(parameterModel);

                searchOptionsParams = parameterCollection;
            } else {
                var fieldnameParameter = searchOptionsParams.findWhere({ id: fieldnameVal });
                if (fieldnameParameter === undefined || fieldnameParameter === null) {
                    parameterModel = new ParameterModel({ id: fieldnameVal, values: [] });
                    parameterModel.get("values").push(minVal);
                   parameterModel.get("values").push(maxVal);

                    searchOptionsParams.push(parameterModel);
                } else {
                    App.Search.searchOptions.get('parameters').get(fieldnameVal).clear();
                    parameterModel = new ParameterModel({ id: fieldnameVal, values: [] });
                    parameterModel.get("values").push(minVal);
                    parameterModel.get("values").push(maxVal);

                    searchOptionsParams.push(parameterModel);
                }
            }


            App.Search.searchOptions.set({ currentPage: 1 });

            UriUtil.updateSearchOptionsHash(searchOptionsParams);
        },
        applyTourLengthRangeFilter: function (minVal, fieldnameVal) {
            var searchOptionsParams = App.Search.searchOptions.get('parameters');

            var parameterModel;
            if (searchOptionsParams.length <= 0) {
                var parameterCollection = new ParameterCollection();
                parameterModel = new ParameterModel({ id: fieldnameVal, values: [] });
                parameterModel.get("values").push(minVal);
                parameterCollection.push(parameterModel);

                searchOptionsParams = parameterCollection;
            } else {
                var fieldnameParameter = searchOptionsParams.findWhere({ id: fieldnameVal });
                if (fieldnameParameter === undefined || fieldnameParameter === null) {
                    parameterModel = new ParameterModel({ id: fieldnameVal, values: [] });
                    parameterModel.get("values").push(minVal);
                    searchOptionsParams.push(parameterModel);
                } else {
                    App.Search.searchOptions.get('parameters').get(fieldnameVal).clear();
                    parameterModel = new ParameterModel({ id: fieldnameVal, values: [] });
                    parameterModel.get("values").push(minVal);
                    searchOptionsParams.push(parameterModel);
                }
               
            }
     
            App.Search.searchOptions.set({ currentPage: 1 });
    
            UriUtil.updateSearchOptionsHash(searchOptionsParams);
           }
    });

    return RangeFilterLayout;
});
