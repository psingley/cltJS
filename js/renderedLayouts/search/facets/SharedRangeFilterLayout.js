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
], function (doc, $, _, Backbone, Marionette, EventAggregator, App, ParameterCollection, ParameterModel, UriUtil, ObjectUtil) {
    var RangeFilterLayout = Backbone.Marionette.Layout.extend({
        initSliders: function (rangeSlider, id) {
            var outerScope = this;

            var minInput = $(rangeSlider).find(".slider-min-input")[0];
            var maxInput = $(rangeSlider).find(".slider-max-input")[0];
            var minInputCopy = null;
            var maxInputCopy = null;

            this.sliderFieldname = $(id).data('fieldname');
            this.sliderMin = parseInt($(rangeSlider).data("min"));
            this.sliderMax = parseInt($(rangeSlider).data("max"));
            this.sliderStep = parseInt($(rangeSlider).data("step"));

            var checkVal = function (flag) {
                $("#priceRangeFilter #priceRangeError").hide();
                $("#tourLengthRange #tourLengthError").hide();
                minInput.value = Math.round(minInput.value);
                maxInput.value = Math.round(maxInput.value);
                if (minInput.value.length > 2 && minInput.maxLength != -1) {
                    minInput.value = minInput.value.slice(0, minInput.maxLength);
                }
                if (maxInput.value.length > 2 && minInput.maxLength != -1) {
                    maxInput.value = maxInput.value.slice(0, maxInput.maxLength);
                }

                if (minInput.value == 0) {
                    minInput.value = $(minInput).attr('placeholder');
                }
                if (maxInput.value == 0) {
                    maxInput.value = $(maxInput).attr('placeholder');
                }
                var displayErrorMessage = false;
                var priceInputs = $('#priceRangeFilter').find('input.form-control');
                if (parseInt(priceInputs[1].value) < parseInt(priceInputs[0].value)) {
                    if (flag)
                        $("#priceRangeFilter #priceRangeError").text("Must be greater than minimum price.");
                    else
                        $("#priceRangeFilter #priceRangeError").text("Must be less than maximum price.");
                    $("#priceRangeFilter #priceRangeError").show();
                    displayErrorMessage = true;
                }

                var tourLengthInputs = $('#tourLengthRange').find('input.form-control');
                if (parseInt(tourLengthInputs[1].value) < parseInt(tourLengthInputs[0].value)) {
                    if (flag)
                        $("#tourLengthRange #tourLengthError").text("Must be greater than minimum tour length.");
                    else
                        $("#tourLengthRange #tourLengthError").text("Must be less than maximum tour length.");
                    $("#tourLengthRange #tourLengthError").show();
                    displayErrorMessage = true;
                }

                if (displayErrorMessage)
                    return false;

                return true;
            }

            var onInputChange = function (flag) {
                if (checkVal(flag)) {
                    // console.log('onInputChange:', id, minInput.value, maxInput.value);
                    outerScope.runSearch(id, minInput.value, maxInput.value);
                }
            }

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
            EventAggregator.on("setDefaultInputValue", function (params) {
                minInputCopy = null;
                maxInputCopy = null;
            });
        },

        runSearch: function (id, min, max) {
            this.applyFilter(min, max, this.sliderFieldname);
            // console.log('in runSearch:', min, max, this.sliderFieldname);
            // console.log('searchAppliedFilt. params:', $(id).data('fieldname'), [min, max]);
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
        }
    });

    return RangeFilterLayout;
});
