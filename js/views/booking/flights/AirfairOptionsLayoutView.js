define([
'jquery',
'underscore',
'backbone',
'app',
'event.aggregator',
'services/bookingService',
'util/taxonomy/taxonomyDomUtil',
'collections/booking/flights/ScheduleCollection',
'views/booking/flights/FlightScheduleListView',
'text!templates/booking/flights/airfairOptionsLayoutTemplate.html',
'collections/booking/flights/ScheduleCollection',
'util/objectUtil'
], function ($, _, Backbone, App, EventAggregator, BookingService, TaxonomyDomUtil, ScheduleCollection, FlightScheduleListView,
airfairOptionsLayoutTemplate, ScheduleCollection, ObjectUtil) {
	var AirfairOptionsLayoutView = Backbone.Marionette.Layout.extend({
		defaults: {
			flightScheduleListView: FlightScheduleListView
		},
		flightSchedules: new ScheduleCollection(),
		flightSchedulesPerPage: 0,
		numberOfFlightSchedulesVisibleCurrently: 0,
		totalFlightSchedules: 0,
		template: Backbone.Marionette.TemplateCache.get(airfairOptionsLayoutTemplate),
		tagName: 'div',
		regions: {
			'flightSchedulesRegion': '#flightSchedulesRegion'
		},
		events: {
			'click div.headers .sort_filter': 'sortClicked',
			'change #airfareTypesSelect': 'filterByFairType',
			'click input[name=flight]': 'updatePrice',
			'click .flight': 'updatePrice',
			'click #viewMoreResults': 'showMoreFlightSchedules'
		},
		initialize: function (options) {
			var outerScope = this;
			this.flightSchedulesPerPage = this.options.FlightSchedulesPerPage;
			EventAggregator.on('flightsFormAirSearchComplete', function () {
				outerScope.flightSchedules = App.Booking.flightSchedules;
				outerScope.totalFlightSchedules = outerScope.flightSchedules.length;
				outerScope.numberOfFlightSchedulesVisibleCurrently = 0;
				outerScope.showFlightSchedules();
				var biasInfo = $('#biasInfo');
                if (!ObjectUtil.isNullOrEmpty(biasInfo)) {
                    $(biasInfo).html(App.dictionary.get('tourRelated.Booking.FlightsProtection.BiasInfo')
                    .replace("{sortColumn}", outerScope.flightSchedules.sortFieldText));
                }
                    
			});

			EventAggregator.on('searchForAirChanged', function () {
				if (!App.Booking.Steps['flightStep'].getAddAir()) {
					outerScope.clearFlightSelection();
				}
			});
		},
		ifPaginationRequiredShowButton: function (flightSchedulesLeft) {
			if (flightSchedulesLeft > 0) {
				$('#viewMoreResults').show();
			}
			else {
				$('#viewMoreResults').hide();
			}
		},

		showMoreFlightSchedules: function (e) {
			e.preventDefault();
			this.flightScheduleListView.collection.add(this.flightSchedules.models.slice(this.numberOfFlightSchedulesVisibleCurrently, this.numberOfFlightSchedulesVisibleCurrently + this.flightSchedulesPerPage));
			this.numberOfFlightSchedulesVisibleCurrently = this.flightScheduleListView.collection.length;
			this.ifPaginationRequiredShowButton(this.totalFlightSchedules - this.numberOfFlightSchedulesVisibleCurrently);
		},

		showFlightSchedules: function () {
			var schedules = new ScheduleCollection();
			schedules.setSortField(this.flightSchedules.sortField, this.flightSchedules.sortDirection, this.flightSchedules.sortFieldText);
			schedules.setFlightSchedulesByExistingScheduleModels(this.flightSchedules.models.slice(0, this.numberOfFlightSchedulesVisibleCurrently
			+ this.flightSchedulesPerPage));
			this.flightScheduleListView = new FlightScheduleListView({ collection: schedules });

			var flightSchedulesRegionObj = $('#flightSchedulesRegion');
			this.flightSchedulesRegion = new Backbone.Marionette.Region({
				el: flightSchedulesRegionObj
			});
			this.flightSchedulesRegion.show(this.flightScheduleListView);

			//select first flight
			if (schedules.length > 0) {
				$('input[name=flight]:first').click();
				this.updatePrice();
			}
			this.numberOfFlightSchedulesVisibleCurrently = schedules.length;
			this.ifPaginationRequiredShowButton(this.totalFlightSchedules - this.numberOfFlightSchedulesVisibleCurrently);
		},

		onShow: function () {
			var $airfareTypesSelector = this.$el.find('#airfareTypesSelect');
			TaxonomyDomUtil.setOptionsWithOutSelect('fareTypes', $airfareTypesSelector);

			//hide the region
			if ($('#hideAirFareFilters').val().toLowerCase() == 'true') {
				$('#airfareTypesRegion').hide();
			} else {
				this.setPrettySelectLists($('#airfareTypesRegion'));
			}
		},
		templateHelpers: function () {
			return {
				showAllAirfareOptionsText: App.dictionary.get('tourRelated.Booking.FlightsProtection.ShowAllAirfareOptions'),
				filterResultsByText: App.dictionary.get('tourRelated.Booking.FlightsProtection.FilterResultsBy'),
				airfareTypeText: App.dictionary.get('tourRelated.Booking.FlightsProtection.AirfareType'),
				stopsText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Stops'),
				arrivalText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Arrival'),
				departureText: App.dictionary.get('tourRelated.Booking.FlightsProtection.Departure'),
				sortByText: App.dictionary.get('common.FormLabels.SortBy'),
				priceText: App.dictionary.get('tourRelated.Booking.RoomingTravelerInfo.LandAndAirPrice'),
				durationText: App.dictionary.get('tourRelated.Booking.Duration'),
				viewMoreResultsText: App.dictionary.get('common.Buttons.ViewMoreResults', 'View More')
			}
		},
		clearFlightSelection: function () {
			var $flight = this.$el.find('input[name=flight]:checked');
			$flight.prop('checked', false);
			App.Booking.Steps['flightStep'].calculateStepPrice();
		},
		setPrettySelectLists: function (element) {
			var $dropDownLists = element.find('select');
			$dropDownLists.prettySelect();
		},
		sortClicked: function (e) {
			e.preventDefault();
			if (this.flightSchedules.length < 1) {
				return;
			}

			var target = $(e.target);
			var sortCode = target.data('sortcode');
			var sortDirection = (target.hasClass('ASC') || target.hasClass('DESC')) ? (target.hasClass('ASC') ? 'DESC' : 'ASC') : 'ASC';
			var oldSortCode = this.flightSchedules.sortField;
			var oldSortDirection = this.flightSchedules.sortDirection;
			var innerText = $(target).text();

			this.flightSchedules.setSortField(sortCode, sortDirection, innerText);
			this.flightSchedules.sort();
			this.flightSchedules.trigger('reset');
			this.numberOfFlightSchedulesVisibleCurrently = this.numberOfFlightSchedulesVisibleCurrently - this.flightSchedulesPerPage;
			var multiple = 0;
			while (this.numberOfFlightSchedulesVisibleCurrently > multiple * this.flightSchedulesPerPage) {
				multiple = multiple + 1;
			}
			this.numberOfFlightSchedulesVisibleCurrently = multiple * this.flightSchedulesPerPage;
			this.showFlightSchedules();

			//reset other header arrows
			$('#airfareOptionsRegion .headers .sort_filter[data-sortcode=' + oldSortCode + ']').removeClass(oldSortDirection);

			var biasInfo = $('#biasInfo');
			if (!ObjectUtil.isNullOrEmpty(biasInfo)) {
			    $(biasInfo).html(App.dictionary.get('tourRelated.Booking.FlightsProtection.BiasInfo')
                .replace("{sortColumn}", this.flightSchedules.sortFieldText));
			}
			if (sortDirection == 'ASC') {
				target.removeClass('DESC');
				target.addClass('ASC');
			} else {
				target.removeClass('ASC');
				target.addClass('DESC');
			}
		},

		updatePrice: function () {
			App.Booking.Steps['flightStep'].calculateStepPrice();
		},
		filterByFairType: function (e) {
			var filterKey = $(e.target).find('option:selected').data('id');
			var filterTitle = $(e.target).find('option:selected').text();
			var outerScope = this;

			var schedules = App.Booking.flightSchedules.filterByFairType(filterKey);

			var hereIsYourTopText = App.dictionary.get('tourRelated.Booking.FlightsProtection.HereIsYourTop'),
			hereAreYourTopText = App.dictionary.get('tourRelated.Booking.FlightsProtection.HereAreYourTop'),
			optionText = App.dictionary.get('tourRelated.Booking.FlightsProtection.Option'),
			optionsText = App.dictionary.get('tourRelated.Booking.FlightsProtection.Options'),
			noOptionFoundText = App.dictionary.get('tourRelated.Booking.FlightsProtection.NoOptionFound');


			var resultsTitle = schedules.length == 1 ? hereIsYourTopText + " " + optionText : hereAreYourTopText + " " + schedules.length + " " + optionsText;

			if (filterKey != '') {
				resultsTitle = schedules.length == 1 ? hereIsYourTopText + " " + filterTitle + " " + optionText : hereAreYourTopText + " " + schedules.length + " " + filterTitle + " " + optionsText;
				if (schedules.length == 0) {
					resultsTitle = noOptionFoundText.replace('{0}', filterTitle);
				}
			}

			if (outerScope.flightSchedules.sortDirection !== schedules.sortDirection || outerScope.flightSchedules.sortField !== schedules.sortField) {
			    schedules.setSortField(outerScope.flightSchedules.sortField, outerScope.flightSchedules.sortDirection, outerScope.flightSchedules.sortFieldText);
				schedules.sort();
			}
			outerScope.flightSchedules = schedules;
			outerScope.totalFlightSchedules = outerScope.flightSchedules.length;
			outerScope.numberOfFlightSchedulesVisibleCurrently = 0;
			outerScope.$el.find('#bestAirfareOptionsInfo').html(resultsTitle);
			outerScope.showFlightSchedules();

			$('showAllAirfareOptions').hide();
		}
	});

	return AirfairOptionsLayoutView;
});

