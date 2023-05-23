define([
	'domReady!',
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'moment',
	'event.aggregator',
	'app',
	'collections/search/searchOptions/ParameterCollection',
	'models/search/searchOptions/ParameterModel',
	'monthpicker',
	'maskedinput',
	'util/uriUtil',
	'goalsUtil',
	'util/objectUtil',
], function (doc, $, _, Backbone, Marionette, moment, EventAggregator, App, ParameterCollection, ParameterModel, monthpicker, maskedinput, UriUtil, GoalsUtil, ObjectUtil) {
	var DateRangeFilterLayout = Backbone.Marionette.Layout.extend({
		el: $('.filter'),
		initialize: function () {

			console.log("its a no good eh");
			var outerScope = this;
			$('.placeholderSlider').hide();

			if ($('#dateRangeFilter').length <= 0) {
				return;
			}
			var dateRangeSlider = $('#dateRangeFilter').children('.date-slider')[0];
			this.sliderFieldnames = $('#dateRangeFilter').data('fieldname').split('|');

			var dateInputs = $('#dateRangeFilter').find('input.form-control');

			var checkDate = function (dateInputEl) {
				var dateInputVal = dateInputEl.val();
				var dateInputMonth = dateInputVal.replace(/\//gi, '').slice(0, 2);
				var dateInputYear = dateInputVal.replace(/\//gi, '').slice(2, dateInputVal.length);

				/* month is over 12 or under 1, rounded to nearest month */
				if (dateInputVal != '') {
					if (dateInputMonth > 12) {
						dateInputVal = '12/' + dateInputYear;
					} else if (dateInputMonth < 1) {
						dateInputVal = '01/' + dateInputYear;
					}
				}
				/* input is blank, rounded to highest/lowest available date */
				if (dateInputVal == '') {
					if (dateInputEl.hasClass('slider-max-input')) {
						if (dateInputVal.length < 6) {
							dateInputVal = '0' + maxMonth.toString() + '/' + maxYear.toString()
						} else {
							dateInputVal = maxMonth.toString() + '/' + maxYear.toString();
						}
					} else if (dateInputEl.hasClass('slider-min-input')) {
						if (dateInputVal.length < 6) {
							dateInputVal = '0' + minMonth.toString() + '/' + minYear.toString();
						} else {
							dateInputVal = minMonth.toString() + '/' + minYear.toString();
						}
					}
				}

				dateInputVal = dateInputVal.replace(/\//gi, '-');
				return dateInputVal;
			}

			/* monthpickers do not scroll with modal */
			var stopMobileModalScroll = function () {
				if ($('.search-filter-modal').hasClass('in') && $(window).width() < 992) {
					$('.search-filter-modal, body.modal-open').addClass('no-scroll');
				}
			}

			var resumeMobileModalScroll = function (e) {
				if (!$(e.target).hasClass('month-year-input') || e.type == 'keydown') {
					$('.search-filter-modal, body').removeClass('no-scroll');
				}
			}

			/* TODO: UN SPAGHETTIFY THIS! */
			var setMonthPickerPosition = function (obj, info) {
				// console.log(obj,info);
				if (!$(info.element.element[0]).hasClass('min-date-monthpicker') ||
					!$(info.element.element[0]).hasClass('max-date-monthpicker')) {
					if ($(info.target.element[0]).hasClass('slider-min-input')) {
						$($(info.element.element[0]).addClass('min-date-monthpicker'))
					} else {
						$($(info.element.element[0]).addClass('max-date-monthpicker'))
					}
				}

				/* picker is on top */
				if (info.vertical == 'bottom') {
					$(this).addClass('flipped');
					/* set position for mobile */
					if ($('.search-filter-modal').hasClass('in')) {
						$(this).css({
							left: obj.left + 'px',
							top: ($('.slider-min-input.month-year-input').offset().top - 240) + 'px'
						});

						return;
					}
				} else {
					$(this).removeClass('flipped');
					/* set position for mobile */
					if ($('.search-filter-modal').hasClass('in')) {
						$(this).css({
							left: obj.left + 'px',
							top: ($('.slider-min-input.month-year-input').offset().top + 52) + 'px'
						});

						return;
					}
				}
				$(this).css({
					left: obj.left + 'px',
					top: obj.top + 'px'
				});
			}

			var defaultDateRange = function (minRange, maxRange) {
				var startYear = minRange.getFullYear();
				/* set monthpickers */
				$(dateInputs[0]).MonthPicker({
					OnBeforeMenuOpen: stopMobileModalScroll,
					OnBeforeMenuClose: resumeMobileModalScroll,
					UseInputMask: true,
					Button: '.slider-range-min.range-input.min-calendar-date',
					StartYear: startYear,
					MinMonth: minRange,
					MaxMonth: maxRange,
					Position: {
						collision: 'flip',
						my: 'left top+10%',
						at: 'left bottom',
						using: setMonthPickerPosition
					}
				});

				$(dateInputs[1]).MonthPicker({
					OnBeforeMenuOpen: stopMobileModalScroll,
					OnBeforeMenuClose: resumeMobileModalScroll,
					UseInputMask: true,
					Button: '.slider-range-max.range-input.max-calendar-date',
					MinMonth: minRange,
					MaxMonth: maxRange,
					Position: {
						collision: 'flip',
						my: 'left top+10%',
						at: 'left bottom',
						using: setMonthPickerPosition
					}
				});

				var minValue = moment(minRange).format("MM/YYYY");
				var maxValue = moment(maxRange).format("MM/YYYY");
				$(dateInputs[0]).attr('placeholder', minValue);
				$(dateInputs[1]).attr('placeholder', maxValue);
				dateInputs[0].value = minValue;
				dateInputs[1].value = maxValue;
			};

			var updateDateRange = function (minRange, maxRange, selectedMin, selectedMax) {
				var startYear = selectedMin.getFullYear();

				/* set monthpickers */
				$(dateInputs[0]).MonthPicker({
					OnBeforeMenuOpen: stopMobileModalScroll,
					OnBeforeMenuClose: resumeMobileModalScroll,
					UseInputMask: true,
					Button: '.slider-range-min.range-input.min-calendar-date',
					StartYear: startYear,
					MinMonth: minRange,
					MaxMonth: selectedMax,
					Position: {
						collision: 'flip',
						my: 'left top+10%',
						at: 'left bottom',
						using: setMonthPickerPosition
					}
				});

				$(dateInputs[1]).MonthPicker({
					OnBeforeMenuOpen: stopMobileModalScroll,
					OnBeforeMenuClose: resumeMobileModalScroll,
					UseInputMask: true,
					Button: '.slider-range-max.range-input.max-calendar-date',
					MinMonth: selectedMin,
					MaxMonth: maxRange,
					Position: {
						collision: 'flip',
						my: 'left top+10%',
						at: 'left bottom',
						using: setMonthPickerPosition
					}
				});

				var minValue = moment(selectedMin).format("MM/YYYY");
				var maxValue = moment(selectedMax).format("MM/YYYY");
				$(dateInputs[0]).attr('placeholder', minValue);
				$(dateInputs[1]).attr('placeholder', maxValue);
				dateInputs[0].value = minValue;
				dateInputs[1].value = maxValue;
			};

			/* close monthpicker on desktop if scroll over 100px */
			var initScroll = null;
			$('.max-calendar-date, .min-calendar-date').on('click', function () {
				initScroll = $(document).scrollTop();
			});

			$(document).scroll(function () {
				var scroll = $(this).scrollTop();
				if (scroll > initScroll + 100 || scroll < initScroll - 100) {
					$(dateInputs[0]).MonthPicker('Close');
					$(dateInputs[1]).MonthPicker('Close');
				}
			});

			window.addEventListener("resize", function () {
				$(dateInputs[0]).MonthPicker('Close');
				$(dateInputs[1]).MonthPicker('Close');
			}, false);

			/* stop jump year ui changes */
			$('td.month-picker-title').find('a').on('click tap hover mouseenter mouseover', function (e) {
				e.stopImmediatePropagation();
				return;
			});

			$(dateInputs).on('update', function (target, handle) {
				// console.log(target, handle);
				outerScope.dateInputs[handle].innerHTML = values[handle];
				outerScope.dateValues[handle].innerHTML = outerScope.formatDate(new Date(+values[handle]));
			});
			$(dateInputs).MonthPicker({
				OnAfterChooseMonth: function () {
					var min = checkDate($(dateInputs[0]));
					var max = checkDate($(dateInputs[1]));

					/* no searching if min > max or max < min */
					var minDate = new Date(min.slice(3, 7), min.slice(0, 2), 0);
					var maxDate = new Date(max.slice(3, 7), max.slice(0, 2), 0);
					if (Date.parse(minDate) > Date.parse(maxDate)) {
						// console.log(min, max);
						$(dateInputs[0]).val(min.replace(/-/gi, '/'));
						$(dateInputs[1]).val(min.replace(/-/gi, '/'));
						outerScope.applyFilter(min, min, outerScope.sliderFieldnames);
						EventAggregator.trigger('searchFilterApplied', $('#dateRangeFilter').data('fieldname'), [min, min]);
						return;
					}
					outerScope.applyFilter(min, max, outerScope.sliderFieldnames);
					EventAggregator.trigger('searchFilterApplied', $('#dateRangeFilter').data('fieldname'), [min, max]);
				}
			});

			EventAggregator.on('requestResultsComplete', function (performSearch) {

				var resultsMin = performSearch.get('minDate');
				var resultsMax = performSearch.get('maxDate');

				var sliderMin = new Date();
				var sliderMax = $(dateRangeSlider).data("max").toString();

				if (performSearch && performSearch.attributes.maxDate) {
					sliderMax = new Date(performSearch.attributes.maxDate);
				}
				if (new Date(resultsMin).getFullYear() == 1 || new Date(resultsMax).getFullYear() == 1) {
					resultsMin = sliderMin;
					resultsMax = sliderMax;
				}
				var searchParams = App.Search.searchOptions.get("parameters");
				if (!searchParams || searchParams.length <= 0 || (searchParams.length == 1 && searchParams.findWhere({ id: "showFacets" }) != null)) {
					defaultDateRange(sliderMin, sliderMax);
				}
				else {
					var startDateRangeParams = searchParams.findWhere({ id: outerScope.sliderFieldnames[0] });
					var endDateRangeParams = searchParams.findWhere({ id: outerScope.sliderFieldnames[1] });
					if (startDateRangeParams && endDateRangeParams && startDateRangeParams.get('values').length > 0 && endDateRangeParams.get('values').length > 0) {
						var startDate = moment(startDateRangeParams.get('values'), "MM-YYYY").format("YYYY-MM-01");
						var endDate = moment(endDateRangeParams.get('values'), "MM-YYYY").format("YYYY-MM-01");
						startDate = moment(startDate).endOf('month');
						endDate = moment(endDate).endOf('month');
						updateDateRange(new Date(resultsMin), new Date(resultsMax), new Date(startDate), new Date(endDate));
					}
					else if (!ObjectUtil.isNullOrEmpty(resultsMin) && !ObjectUtil.isNullOrEmpty(resultsMax)) {
						defaultDateRange(new Date(resultsMin), new Date(resultsMax));
					}
				}
			});
		},

		yearTimestamp: function (str) {
			return new Date(str).getTime();
		},
		formatDate: function (date) {
			var months = [
				"Jan", "Feb", "Mar",
				"Apr", "May", "Jun", "Jul",
				"Aug", "Sep", "Oct",
				"Nov", "Dec"
			];

			return months[date.getMonth()] + " " + date.getFullYear();
		},
		applyFilter: function (startVal, endVal, fieldnameValues) {


			var searchOptionsParams = App.Search.searchOptions.get('parameters');

			var startParameterModel;
			var endParameterModel;

			if (searchOptionsParams.length <= 0) {
				var parameterCollection = new ParameterCollection();

				startParameterModel = new ParameterModel({ id: fieldnameValues[0], values: [] });
				startParameterModel.get("values").push(startVal);
				parameterCollection.push(startParameterModel);

				endParameterModel = new ParameterModel({ id: fieldnameValues[1], values: [] });
				endParameterModel.get("values").push(endVal);
				parameterCollection.push(endParameterModel);

				searchOptionsParams = parameterCollection;
			} else {
				var startParameter = searchOptionsParams.findWhere({ id: fieldnameValues[0] });
				if (startParameter === undefined || startParameter === null) {
					startParameterModel = new ParameterModel({ id: fieldnameValues[0], values: [] });
					startParameterModel.get("values").push(startVal);

					searchOptionsParams.push(startParameterModel);
				} else {
					App.Search.searchOptions.get('parameters').get(fieldnameValues[0]).clear();
					startParameterModel = new ParameterModel({ id: fieldnameValues[0], values: [] });
					startParameterModel.get("values").push(startVal);

					searchOptionsParams.push(startParameterModel);
				}

				var endParameter = searchOptionsParams.findWhere({ id: fieldnameValues[1] });
				if (endParameter === undefined || endParameter === null) {
					endParameterModel = new ParameterModel({ id: fieldnameValues[1], values: [] });
					endParameterModel.get("values").push(endVal);

					searchOptionsParams.push(endParameterModel);
				} else {
					App.Search.searchOptions.get('parameters').get(fieldnameValues[1]).clear();
					endParameterModel = new ParameterModel({ id: fieldnameValues[1], values: [] });
					endParameterModel.get("values").push(endVal);

					searchOptionsParams.push(endParameterModel);
				}
			}

			App.Search.searchOptions.set({ currentPage: 1 });
			// console.log(searchOptionsParams);
			UriUtil.updateSearchOptionsHash(searchOptionsParams);
		}
	});

	return DateRangeFilterLayout;
});