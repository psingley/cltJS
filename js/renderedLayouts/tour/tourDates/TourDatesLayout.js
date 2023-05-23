define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'moment',
	'app',
	'event.aggregator',
	'extensions/marionette/views/RenderedLayout',
	'util/uriUtil',
	'util/tourDetailUtil',
	'util/seoTaggingUtil',
	'util/objectUtil',
	'util/dateUtil',
	'util/offersUtil',
	'util/animationUtil',
	'util/trackingPixelUtil',
	'services/tourService',
	'views/tour/tourDates/TourDateYearListView',
	'views/tour/tourDates/yearTabs/YearTabListView',
	'collections/tour/tourDates/TourDateCollection',
	'collections/tour/tourDates/TourDatesByYearCollection',
	'collections/tour/tourDates/TourDatesByMonthCollection',
	'models/tour/tourDates/TourDatesByMonthModel',
	'models/tour/tourDates/TourDatesByYearModel',
	'renderedLayouts/pageComponent/OffersModalLayout'
], function ($, _, Backbone, Marionette, moment, App, EventAggregator, RenderedLayout, UriUtil, TourDetailUtil, SeoTaggingUtil, ObjectUtil, DateUtil, OffersUtil, AnimationUtil, TrackingPixelUtil, TourService,
	TourDateYearListView, YearTabListView, TourDateCollection, TourDatesByYearCollection, TourDatesByMonthCollection, TourDatesByMonthModel, TourDatesByYearModel, OffersModalLayout) {

	var animationDelay = 2000;
	var loaderStartTime = new Date();

	var TourDateLayout = RenderedLayout.extend({
		el: '#dates_section_container',
		events: {
			'click .itinerary-button': 'changeDate',
			'click .call_now_button': 'openCallNowModal',
			'click #viewItineraryButton': 'trackItineraryPixel',
			'shown.bs.tab': 'renderScrollText'
		},
		ui: {
		    '$tabs': '.tab-content'
		},
        
		regions: {
			tabHeaders: ".year-tabs",
			tabContent: ".tab-content"
		},
		initialize: function(){
			var outerScope = this;
            EventAggregator.on('tourPageLoadComplete', function(){
                outerScope.pageWasLoaded = true;
                outerScope.tryScroll();
			});
        },
		changeDate: function (e) {
			e.preventDefault();
			AnimationUtil.startItineraryAnimationWithMetrics(loaderStartTime, this._getSectionLoader());
			this.setPackageDateRoute($(e.currentTarget).attr("value"));
			this.setItineraryButton(e);
		},
		setItineraryButton: function (e) {
			var outerScope = this.ui.$tabs;
			outerScope.find('.dates-pane').each(function () {
				var lastClicked = outerScope.find('.btn-success');
				lastClicked.hide();
				lastClicked.siblings().closest("#viewItineraryButton").show();
			});
			var clicked;
			if (e.currentTarget) {
				clicked = $(e.currentTarget);
			} else {
				clicked = $(e);
			}


			var view = clicked.closest("#viewItineraryButton");
			var select = view.siblings().closest("#selectedItineraryButton");

			view.hide();
			select.show();
			select.prop("disabled", true);

			this.setItineraryHeader(view);
		},
		
	trackItineraryPixel: function (e) {
		e.preventDefault();
		var clicked = $(e.currentTarget);
		var startDate = clicked.attr('startDate');
		var endDate = clicked.attr('endDate');
		TrackingPixelUtil.trackItineraryPixel(startDate, endDate);
	},

	packageDateFinder: function () {
		return new RegExp("packageDate=({)?[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}(})?$", "i");
	},

	setItineraryHeader: function(view) {
		var forText = App.dictionary.get("common.Misc.For");
		var titleText = App.dictionary.get("tourRelated.FreeFormText.YourItinerary");

		var startDate = view.attr("startdate");
		var endDate = view.attr("enddate");
		var dateText = DateUtil.getMomentDateType(startDate).format('ll') + ' - ' + DateUtil.getMomentDateType(endDate).format('ll');
		
		var $itineraryHeader = $("#itinerary_section"),
			 $textTarget = $itineraryHeader.find('header').find('h2').find("span");

		$textTarget.text(titleText + " " + forText + " " + dateText);

		var notesModal = $('#itinerary_notes_modal');
		if (notesModal.length > 0) {
		    var notesButton = $('.itineraryModalButton');
		    notesButton.show();
	    }
	},

	setPackageDateRoute: function (packageDateId) {
		var outerscope = this;
		if (!ObjectUtil.isNullOrEmpty(packageDateId)) {
			this.setSelectedDate(packageDateId);
            var tourDetailOptions = {
                packageDateId: packageDateId,
                currentItemId: App.siteSettings.currentItemId
            };
            TourService.getTourDetails(tourDetailOptions);

			EventAggregator.on('tourDetailsRequestComplete', function () {
                	
				var waitTime = animationDelay - (Date.now() - loaderStartTime);
				waitTime = waitTime > 0 ? waitTime : 0;
				setTimeout(function() {
					AnimationUtil.endItineraryAnimation(outerscope._getSectionLoader());
					if (!App.isBooking) {
						var itineraryExpanded = $("#yourItinerary").find(".expanded");
						if (itineraryExpanded && itineraryExpanded.length > 0) {
							outerscope.openItineraryDetails();
						}
					}
				}, waitTime);
			});
		}
	},
        
	openItineraryDetails: function () {
		var $viewMore = $("#itineraryDetailsViewMore"),
		$textTarget = $viewMore.find("span"),
		$container = $viewMore.closest('.container'),
		$details = $viewMore.siblings(".section").find(".expanded");

		$textTarget.text("Close");
		$('body, html').animate({ scrollTop: $container.offset().top }, function () {
			$details.slideDown();
			if (!$viewMore.hasClass("close")) {
				$viewMore.toggleClass("close");
			}
		});
	},
	openCallNowModal: function (e) {
		$('#call-now-modal').modal('show');
	},
	setSelectedDate: function (packageDateId) {
		//when package date is set make call to web service
		if (!ObjectUtil.isNullOrEmpty(packageDateId)) {
			var radioButton = _.find($("input[name=date]:radio"), function (date) {
				var $date = $(date);
				return $date.val() == packageDateId;
			});

			if (!ObjectUtil.isNullOrEmpty(radioButton)) {
				var $radioButton = $(radioButton);
				$radioButton.prop('checked', true);
			}

			var dateInfo = _.find(App.Tour.TourDates.models, function(date){
				return date.get("id") == packageDateId;
			});

            var divId;
			if (dateInfo !== null){
                var d = moment(dateInfo.get("startDate")).toDate();
                var year = d.getFullYear();
                divId = year + "-dates";
                $('[href="#' + divId + '"]').tab('show');
			}

			var div = $("#"+divId);

            var itineraryButton = $("#dates_section_container a.itinerary-button[value='" + packageDateId + "']");

            //as long as the itinerary button exists, it will be updated as selected and the header will be updated with the date
            if (itineraryButton && itineraryButton.length > 0) {
                this.setItineraryButton(itineraryButton[0]);
                this.scrollParams = {
                    div: div,
                    button: itineraryButton
                };
                this.tryScroll();
            }

			//only do if there is a book now button
			this.addToBookNowHref(packageDateId);
			this.addToEmailButton(packageDateId);
            this.replacePackageDateId("#pdfLink", packageDateId);
        
		}

		//display ready_to_book_section
		if (!App.mobile) {
			$('#ready_to_book_section').show();
		}
	},
	tryScroll: function(){
		if (this.scrollParams != null && this.pageWasLoaded && this.datesLoaded) {
            var div = this.scrollParams.div;
            div.animate({scrollTop: this.scrollParams.button.closest(".date-group").offset().top - div.offset().top});
        }
	},
	
	addToBookNowHref: function (packageDateId) {

		var viewItineraryAnchor = $("a#viewItineraryButton[value='" + packageDateId + "']");
		if (ObjectUtil.isNullOrEmpty(viewItineraryAnchor) || viewItineraryAnchor.length == 0) {
		    this.resetBookNowHref("#tour-hero-book-now");
			return;
		}

		var bookNowAnchor = $(viewItineraryAnchor).parent().find('.BookNowButton_Dates');
		if (ObjectUtil.isNullOrEmpty(bookNowAnchor) || bookNowAnchor.length == 0) {
			//there is no booknow button so we need to remove any previous date on the 
			//main book now button
			this.resetBookNowHref("#tour-hero-book-now");
			return;
		}
		this.replacePackageDateId("#tour-hero-book-now", packageDateId);
	},

	resetBookNowHref: function (selector) {
		var existingHref = $(selector).attr("href");
		if (!ObjectUtil.isNullOrEmpty(existingHref)) {
			var newHref = UriUtil.deleteParameterByName(existingHref, "packageDate");
			$(selector).prop("href", newHref);
		}
	},

	replacePackageDateId: function (selector, packageDateId) {
        var existingHref = $(selector).attr('href');
        if (!ObjectUtil.isNullOrEmpty(existingHref)) {

            //check if package date parameter has already been added
            var packageDateIndex = existingHref.search(this.packageDateFinder());
            var newPackageDateId = "packageDate=" + packageDateId;
            if (packageDateIndex > -1) {
                var newHref = existingHref.replace(this.packageDateFinder(), newPackageDateId);
                $(selector).prop("href", newHref);
            }
            else {
                var separator = "?";
                if (existingHref.indexOf(separator) > -1) {
                    separator = "&";
                }
                //add package date parameter
                existingHref = existingHref + separator + newPackageDateId;
                $(selector).prop("href", existingHref);
            }
        }
    },

	addToEmailButton: function (packageDateId) {
		if (!ObjectUtil.isNullOrEmpty(packageDateId)) {
			$('#emailButton').attr('value', packageDateId);
		}
	},

	buildTourDateSelectors: function (tourDatesCollection) {
		var outerScope = this;
		var pickFromCount = tourDatesCollection.length;
		this.renderOffersModal(tourDatesCollection);
		var datesByYears = this.getYearsCollection(tourDatesCollection);
		this.tabHeaders.show(new YearTabListView({ collection: datesByYears }));
		this.tabContent.show(new TourDateYearListView({ collection: datesByYears }));
		TourDetailUtil.generatePickFromText(pickFromCount);
		$(this.$el).popover({
			selector: '.tour-event',
			trigger: 'hover'
		});
		this.renderScrollText();
        AnimationUtil.endLoadingAnimation();
        this.datesLoaded = true;
        this.tryScroll();
        
	},

	renderOffersModal: function(tourDatesCollection){
		var discount = null;
		var vanityToShow = null;
		tourDatesCollection.models.forEach(function (item) {
			var currentDiscount = item.get("discount");
			if (currentDiscount != null && OffersUtil.isOfferValid(currentDiscount)){
				if (discount == null || currentDiscount.rate > discount.offerRate ){
					var vanity = OffersUtil.getCurrentVanityCodeObject(currentDiscount);
					if (vanity != null)
					{
						discount = currentDiscount;
						vanityToShow = vanity;
					}
				}
			}
		});
		if (vanityToShow != null){
			new OffersModalLayout({vanity: vanityToShow});
		}
	},

	renderScrollText: function () {
		var activeTab = $(".dates-pane.tab-pane.active");
		if (activeTab.length == 0) {
			return;
		}
		if (activeTab.hasScrollBar()) {
			$('.scroll-me').addClass("show-scroll-me");
		}
		else {
			$('.scroll-me').removeClass("show-scroll-me");
		}
	},

	getYearsCollection: function (tourDatesCollection) {
		var result = new TourDatesByYearCollection();
		tourDatesCollection.models.forEach(function (item) {
			var date = moment(item.get("startDate")).toDate();
			var year = date.getFullYear();
			var monthId = date.getMonth();
			var monthName = DateUtil.getMonthName(item.get("startDate"));
			var yearModel = result.findWhere({ year: year });
			if (yearModel != undefined) {
				var months = yearModel.get("datesByMonth");
				var monthModel = months.findWhere({ monthId: monthId });
				if (monthModel != undefined) {
					monthModel.set("dates", monthModel.get("dates").add(item))
				}
				else {
					yearModel.set("datesByMonth", months.add(new TourDatesByMonthModel({
						year: year,
						monthId: monthId,
						monthName: monthName,
						dates: new TourDateCollection(item)
					})));
				}
			}
			else {
				result.add(new TourDatesByYearModel({
					year: year,
					datesByMonth: new TourDatesByMonthCollection(new TourDatesByMonthModel({
						year: year,
						monthId: monthId,
						monthName: monthName,
						dates: new TourDateCollection(item)
					}))
				}));
			}
		});
		return result;
		},
		_getSectionLoader: function(){
			return $("#date-section-loader");
		}
});
return TourDateLayout;
});