define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'views/tourDetailPage/tourDates/TourDateListView',
    'collections/tour/tourDates/TourDatesByYearCollection',
    'services/tourService',
    'util/objectUtil',
    'util/uriUtil',
    'util/trackingPixelUtil',
    'util/animationUtil',
    'util/dateUtil'
],
    function ($,
        _,
        Backbone,
        Marionette,
        App,
        EventAggregator,
        TourDateListView,
        TourDatesByYearCollection,
        TourService,
        ObjectUtil,
        UriUtil,
        TrackingPixelUtil,
        AnimationUtil,
        DateUtil) {
        var animationDelay = 2000;
        var loaderStartTime = new Date();

        var TourDateYearListView = Backbone.Marionette.CollectionView.extend({
            collection: TourDatesByYearCollection,
            itemView: TourDateListView,
            itemViewOptions: function (model, index) {
                if (index == 0) {
                    return { active: true };
                } else {
                    return {};
                }
            },
            onRender: function () {
                console.log(document.getElementById("newTourDetails"));
            },
            onShow: function () {
                //This is used to prevent the element from being wrapped in a <div> tag by default
                this.$el = this.$el.children();
                this.$el.unwrap();

                var divTags = $(".tours-list-year");
                if (divTags.parent().is("div"))
                    divTags.unwrap();

                var outerScope = this;

                //if (App.isExplorationsSite) {
                //    var bookNowUrl = $('.tour-detail-hero-book-now').data('bookingurl');
                //    $("#book-now-button-continue").attr("href", bookNowUrl);
                //}

                $.fn.itineraryTourDropdown = function () {
                    return this.each(function () {
                        var $parent = $(this);
                        var $collection = outerScope.collection;
                        var $toursList = $parent.find('.tours-list');
                        // individual clickable date buttons
                        var $tourDates = $toursList.find('.tour-banner');
                        // the top display date that changes on selection from the list
                        var $activeDate = $parent.find('.active-tour-banner');
                        var $datesSection = $(document).find("#tour-detail-dates-section");
                        // stores a reference to the selected date (tour-banner) in the drop down list to toggle highlighted class (this is not the top display date)
                        var $selectedDate = undefined;

                        var $yearSelector = $(document).find('.tour-year-selector');
                        var $selectedYear = undefined;
                        var $yearsList = $toursList.find('.tours-list-year');
                        var $selectedYearList = undefined;

                        var $moreToursBtn = $parent.find('#more-tours-button-selector');

                        var toggleMoreToursButton = function (i) {
                            if ($collection.length > 0 && $collection.models[i].get('dates').length > 1)
                                $moreToursBtn.show();
                            else
                                $moreToursBtn.hide();
                        };

                        // set the selected date from the is-active class in the html file
                        $yearSelector.each(function () {
                            if ($collection.length > 1 && $collection.models[$(this).index()].get('dates').length == 1 && $collection.models[$(this).index()].attributes.dates.models[0].attributes.isSoldOut && $(this).hasClass('is-selected'))
                                $(this).removeClass('is-selected');
                            else {
                                if ($(this).addClass('is-selected') === false)
                                    $(this).addClass('is-selected');
                                $selectedYear = $(this);
                                toggleMoreToursButton($(this).index());
                                return false;
                            }
                        });
                        if ($selectedYear === undefined) {
                            console.log("missing selected year in itinerary date picker");
                        }
                        // set the selected date from the is-active class in the html file
                        $yearsList.each(function () {
                            if ($collection.length > 1 && $collection.models[$(this).index()].get('dates').length == 1 && $collection.models[$(this).index()].attributes.dates.models[0].attributes.isSoldOut && $(this).hasClass('is-active'))
                                $(this).removeClass('is-active');
                            else {
                                if ($(this).addClass('is-active') === false)
                                    $(this).addClass('is-active')
                                $selectedYearList = $(this);
                                return false;
                            }
                        });
                        if ($selectedYear === undefined) {
                            console.log("missing active year list in itinerary date picker");
                        }
                        var initialTourDate = function (year) {
                            return _.find($tourDates, function (td) {
                                var date = new Date($(td).data('startdate'));
                                return date.getFullYear() == year;
                            });
                        };

                        $yearSelector.on('click',
                            function () {
                                toggleMoreToursButton($(this).index());
                                //update year selector display
                                if ($selectedYear !== undefined) {
                                    $selectedYear.removeClass('is-selected');
                                }
                                $selectedYear = $(this);
                                $selectedYear.addClass('is-selected');
                                var $year = $(this).data('year');
                                var makeDropDownActive = true;
                                if ($parent.hasClass('is-open') === false) {
                                    $parent.addClass('is-open');
                                }
                                var yearSelectionProcessed = false;
                                if (!($collection.models[$(this).index()].get('dates').length > 1)) {
                                    var tourDate = initialTourDate($year);
                                    if (tourDate && $selectedDate !== undefined && !(new Date($selectedDate.data('startdate')).getFullYear() == $year)) {
                                        selectTourDate(tourDate);
                                        if ($parent.hasClass('is-open') === true)
                                            $parent.removeClass('is-open');
                                    }
                                    makeDropDownActive = false;
                                    yearSelectionProcessed = true;
                                }
                                if (!yearSelectionProcessed && $selectedDate !== undefined && $selectedDate.hasClass('sold-out') && $selectedDate.hasClass('is-active')) {
                                    var tourDate = initialTourDate($year);
                                    if (tourDate)
                                        selectTourDate(tourDate);
                                }

                                //}
                                if ($selectedYearList !== undefined) {
                                    $selectedYearList.removeClass('is-active');
                                }
                                // update dates display using data-year-id attribute to match with a tour-list-year id attribute
                                var newYearId = $(this).attr('data-year-id');
                                var $newYear = $parent.find('#' + newYearId);
                                if (makeDropDownActive) {
                                    $newYear.addClass('is-active');
                                }
                                $toursList.animate({ scrollTop: 0 }, 'fast');
                                $selectedYearList = $newYear;
                            });
                        var selectTourDate = function (obj) {
                            if ($selectedDate !== undefined) {
                                $selectedDate.removeClass('is-active');
                            }
                            $selectedDate = $(obj);
                            $(obj).addClass('is-active');

                            var currPackageDateID = $(obj).data('packagedateid');
                            var startDate = $(obj).data('startdate');
                            var endDate = $(obj).data('enddate');
                            TrackingPixelUtil.trackItineraryPixel(startDate, endDate);
                        
                            document.getElementById("newTourDetails").setAttribute("data-packagedateid", $(obj).data('packagendateneoid'));
                            document.getElementById("newTourDetails").setAttribute("data-packageid", $(obj).data('packageneoid'));
                            document.getElementById("newTourDetails").setAttribute("data-tourSeriesId", $(obj).data('neoid'));
                            document.getElementById("newTourDetails").setAttribute("data-packagedate", DateUtil.getMomentDateType($(obj).data('startdate')).format('ll') + ' - ' + DateUtil.getMomentDateType($(obj).data('enddate')).format('ll'));
                            document.getElementById("newTourDetails").setAttribute("data-totaldays", $(obj).data('days'));
                            document.getElementById("newTourDetails").setAttribute("data-action", 'date changed');
                            document.getElementById("newTourDetails").setAttribute("data-startdate", DateUtil.getMomentDateType(startDate).format('ll'));
                            document.getElementById("newTourDetails").setAttribute("data-enddate", DateUtil.getMomentDateType(endDate).format('ll'));

                          

                            $activeDate.html($(obj).clone());

                            $('#print-selected-date').text(DateUtil.getMomentDateType(startDate).format('ll') + ' - ' + DateUtil.getMomentDateType(endDate).format('ll'));
                            outerScope.setMapMealsDays($(obj));
                            outerScope.setOfferDetails($(obj));
                            outerScope.addToHubspotForm($(obj));
                            outerScope.changeDate(currPackageDateID, startDate, endDate);
                            outerScope.replacePackageDateId(".tour-detail-hero-book-now", currPackageDateID);
                          
                        };

                        $tourDates.on('click',
                            function () {
                                if ($(this).hasClass('sold-out') === false) {
                                    $parent.toggleClass('is-open');

                                    selectTourDate(this);

                                }
                            });

                        // set the selected date from the is-active class in the html file
                        var unProcessedDateCount = 0;
                        $tourDates.each(function () {
                            var dateIdFromUrl = $datesSection.data("packagedateid");
                            var $dateToChange = $(this);

                            if (ObjectUtil.isNullOrEmpty(dateIdFromUrl)) {
                                var isFirstDate = true;
                                //default behavior
                                if ($dateToChange.hasClass('sold-out') === false) {
                                    $selectedDate = outerScope.processDateChange($selectedDate, $activeDate, $dateToChange, isFirstDate);
                                    return false;
                                }
                                else
                                    unProcessedDateCount++;
                            } else if ($dateToChange.data("packagedateid") == dateIdFromUrl) {
                                var isFirstDate = false;
                                $selectedDate = outerScope.processDateChange($selectedDate, $activeDate, $dateToChange, isFirstDate);
                                return false;
                            }
                        });

                        /// When a tour gets sold out then initial year has to be selected by default.
                        if (unProcessedDateCount == $tourDates.length) {
                            $yearSelector.each(function () {
                                if ($(this).hasClass('is-selected'))
                                    $(this).removeClass('is-selected');
                                if ($parent.hasClass('is-open') === true)
                                    $parent.removeClass('is-open');
                            });
                            $selectedYear = $yearSelector.first();
                            $selectedYear.addClass('is-selected');
                            $selectedDate = outerScope.processDateChange($selectedDate, $activeDate, $tourDates.first(), true);
                        }

                        $moreToursBtn.on('click',
                            function () {
                                $parent.toggleClass('is-open');
                            });
                    });
                };
                $('.tour-banners-wrap').itineraryTourDropdown();

            },
            processDateChange: function ($selectedDate, $activeDate, $dateToActive, isFirstDate) {
                var outerScope = this;
                if ($selectedDate !== undefined) {
                    $selectedDate.removeClass('is-active');
                }

                $selectedDate = $dateToActive;
                $dateToActive.addClass('is-active');

                $activeDate.html($dateToActive.clone());

                //isFirstDate is True then remove the Seats Remaining Text... WEB-700
                if (isFirstDate) {
                    var $hideTheElement = $activeDate.find('#seatsRemaingSelector');
                    if ($hideTheElement) {
                        $hideTheElement.hide();
                    }
                }


                var currPackageDateID = $dateToActive.data('packagedateid');
                var startDate = $dateToActive.data('startdate');
                var endDate = $dateToActive.data('enddate');
                $('#print-selected-date').text(DateUtil.getMomentDateType(startDate).format('ll') +
                    ' - ' +
                    DateUtil.getMomentDateType(endDate).format('ll'));
                outerScope.setMapMealsDays($dateToActive);
                outerScope.setOfferDetails($dateToActive);
                outerScope.changeDate(currPackageDateID, startDate, endDate);

                if (!isFirstDate) {
                    outerScope.replacePackageDateId(".tour-detail-hero-book-now", currPackageDateID);
                }
                return $selectedDate;
            },
            changeDate: function (packagedateid, startDate, endDate) {
                AnimationUtil.startItineraryAnimation(this._getSectionLoader());
                this.setPackageDateRoute(packagedateid);

            },
            setPackageDateRoute: function (packageDateId) {
                var outerscope = this;
                if (!ObjectUtil.isNullOrEmpty(packageDateId)) {

                    var tourDetailOptions = {
                        packageDateId: packageDateId,
                        currentItemId: App.siteSettings.currentItemId
                    };
                    TourService.getTourDetails(tourDetailOptions);
                    // append current package date to pdf generation url
                    outerscope.replacePackageDateId("#pdfLink", tourDetailOptions.packageDateId);
                    // show share pdf button now that all data has loaded
                    $('#pdfShare').fadeIn();

                    EventAggregator.on('tourDetailsRequestComplete', function () {
                        var waitTime = animationDelay - (Date.now() - loaderStartTime);
                        waitTime = waitTime > 0 ? waitTime : 0;
                        setTimeout(function () {
                            AnimationUtil.endItineraryAnimation(outerscope._getSectionLoader());
                        }, waitTime);
                    });
                }
            },
            setMapMealsDays: function (model) {
                var normalizeMeal = function (meal) {
                    if (!meal) {
                        return 0;
                    }
                    return meal;
                };
                var mapImageUrl = model.data('mapimageurl');
                var mapImageAlt = model.data('mapimagealt');
                $('#map-image').attr('src', mapImageUrl);
                $('#map-image').attr('alt', mapImageAlt);

                var breakfast = model.data('breakfast');
                var lunch = model.data('lunch');
                var dinner = model.data('dinner');
                // do not use raw values, because JS number + undefined = NaN and total meals will
                // be NaN if at least one value is undefined.
                // use normalizeMeal function
                var totalMeals = normalizeMeal(breakfast) + normalizeMeal(lunch) + normalizeMeal(dinner);
                var days = model.data('days');
                var nights = days - 1;


                if (breakfast != null) {
                    var breakfastText = (breakfast == "1") ? "Breakfast" : "Breakfasts";
                    $('#highlight-breakfasts').text(breakfast + " " + breakfastText);
                }
                if (lunch != null) {
                    var lunchText = (lunch == "1") ? "Lunch" : "Lunches";
                    $('#highlight-lunch').text(lunch + " " + lunchText);
                }
                if (dinner != null) {
                    var dinnerText = (dinner == "1") ? "Dinner" : "Dinners";
                    $('#highlight-dinners').text(dinner + " " + dinnerText);
                }
                if (totalMeals > 0) {
                    var mealText = (totalMeals == "1") ? "Meal" : "Meals";
                    $('#highlight-totalMeals').text(totalMeals + " " + mealText);
                }
                if (days != null) {
                    $('#highlight-days').text(days + " Days");
                    $('#highlight-nights').text(nights + " Nights");
                }
            },
            setOfferDetails: function (model) {
                var offerclasshtml = model.data('offerclasshtml');
                var offersummary = model.data('offersummary');
                var offerdetails = model.data('offerdetails');
                var offerDeatilArea = $('.selected-offer-details');

                if (offerclasshtml != null && offersummary != null) {
                    offerDeatilArea.show();
                    offerDeatilArea.find('.offer-icon').html(offerclasshtml);
                    offerDeatilArea.find('.offer-summary').html(offersummary);
                    offerDeatilArea.find('.offer-details').html(offerdetails);
                } else {
                    offerDeatilArea.hide();
                }
            },
            addToHubspotForm: function ($activeTourBanner) {
                var dateSelected = $activeTourBanner.find('.date').html();
                if (dateSelected != '') {
                    $('.hs_tour_date_selected input').val(dateSelected);
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
            packageDateFinder: function () {
                return new RegExp("packageDate=({)?[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}(})?$", "i");
            },
            _getSectionLoader: function () {
                return $("#itinerary-loader");
            }
        });
        // Our module now returns our view
        return TourDateYearListView;
    });
