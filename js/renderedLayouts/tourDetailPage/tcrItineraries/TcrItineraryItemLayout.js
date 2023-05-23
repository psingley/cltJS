define([
    'knockout',
    'jquery',
    'moment'
], function (ko, $, moment) {
    function TcrItineraryItemLayout(params) {
        var self = this;
        self.state = { timeline: 0, map: 1, preNightExt: 2, postNightExt: 3, preTourExt: 4, postTourExt: 5 };
        self.convert = function (rawData) {
            return rawData !== null && rawData !== undefined ? rawData : '';
        }

        self.timeline = ko.observableArray();
        self.currentItinerary = ko.observable();
        self.currentState = ko.observable(self.state.timeline);
        self.currentSelectedDay = ko.observable(0);
        self.map = ko.observable();
        self.toolbar = ko.observable();
        self.cover = ko.observable();

        self.data = params.data;
        self.model = ko.observable();

        self.extensionData = params.extensions;
        self.extensionModels = ko.observable();

        self.tourInfo = ko.observable({
            companyLogo: '',
            tourImage: '',
            tourTitle: '',
            tourSubTitle: '',
            packageDate: '',
        });

        var commonInterval = setInterval(function () {
            if ($("#tcr-tour-info") && $("#tcr-tour-info").length > 0) {
                self.initCommonData();
            }
        }, 1000);

        self.initCommonData = function () {
            self.tourInfo({
                companyLogo: self.convert($("#tcr-tour-info")[0].dataset.companylogo),
                tourImage: self.convert($("#tcr-tour-info")[0].dataset.tourimage),
                tourTitle: self.convert($("#tcr-tour-info")[0].dataset.tourtitle),
                tourSubTitle: self.convert($("#tcr-tour-info")[0].dataset.toursubtitle),
                packageDate: self.packageDate()
            });
            clearInterval(commonInterval);
        }

        self.hasData = ko.computed(function () {
            return !!self.model();
        });

        self.mainItineraries = ko.computed(function () {
            return !!self.model() ? self.model().mainPackage.itineraryDays.filter(x => !x.isExtension) : null;
        });

        self.getItineraryDay = function (itinerary) {
            var headingTitle = "Day " + itinerary.dayNumberDisplay + ": " + itinerary.heading;
            if (self.model().isPreNight)
                headingTitle = "Pre-Night" + ": " + sitinerary.supplier.city;
            if (self.model().isPostNight)
                headingTitle = "Post-Night" + ": " + itinerary.supplier.city;

            return headingTitle;
        }

        self.getItineraryCulinerary = function (itinerary) {
            let culinary = [];
            if (itinerary.breakfast) culinary.push('Breakfast');
            if (itinerary.lunch) culinary.push('Lunch');
            if (itinerary.dinner) culinary.push('Dinner');
            return culinary.length > 0 ? culinary.join(' & ') : '';
        }

        self.packageDate = ko.computed(function () {
            if ($("#newTourDetails").length > 0) {
                return $("#newTourDetails")[0].dataset.startdateformatted;
            }
            return '';
        });

        self.startDate = ko.observable();
        self.startDate($("#newTourDetails")[0].dataset.startdateformatted);

        self.initToolbarView = function (viewModel, mode) {
            // init toolbar (cover image, navigation bar, tools, etc)

            self.toolbar({
                packageDate: self.packageDate(),
                currentPrice: {},
                hasPreTour: viewModel.hasPreTour,
                hasPostTour: viewModel.hasPostTour,
                hasPreNight: viewModel.hasPreNight,
                hasPostNight: viewModel.hasPostNight,
                mode: mode
            });
        };

        self.initCoverView = function (currentDay, price) {
            if (!!currentDay) {
                let stateTile = '';
                switch (self.currentState()) {
                    case self.state.preNightExt:
                        stateTile = 'Pre-Night Extension';
                        break;
                    case self.state.postNightExt:
                        stateTile = 'Post-Night Extension';
                        break;
                    case self.state.preTourExt:
                        stateTile = 'Pre-Tour Extension';
                        break;
                    case self.state.postTourExt:
                        stateTile = 'Post-Tour Extension';
                        break;
                }
                self.cover({
                    coverImageUrl: currentDay.coverImageUrl,
                    isExtension: currentDay.isExtension,
                    price: price,
                    currentExtensionLabel: stateTile
                });
            }
        };

        self.getCurrentItineraryDays = function () {
            switch (self.currentState()) {
                case self.state.timeline:
                    let itineraryList = (self.model().hasPreTour || (!self.model().hasPreTour && !self.model().hasPostTour && self.model().hasPreNight)) ? [
                        {
                            day: -1,
                            isPreNight: !self.model().hasPreTour && !self.model().hasPostTour && self.model().hasPreNight,
                            isPreTour: self.model().hasPreTour,
                            isPostNight: false,
                            isPostTour: false,
                            isExtension: false,
                        }, ...self.model().mainPackage.itineraryDays.filter(x => !x.isExtension)]
                        : self.model().mainPackage.itineraryDays.filter(x => !x.isExtension);
                    if (self.model().hasPostTour || (!self.model().hasPostTour && !self.model().hasPreTour && self.model().hasPostNight)) {
                        itineraryList.push({
                            day: -1,
                            isPreNight: false,
                            isPreTour: false,
                            isPostNight: !self.model().hasPostTour && !self.model().hasPreTour && self.model().hasPostNight,
                            isPostTour: self.model().hasPostTour,
                            isExtension: false,
                        });
                    }
                    return itineraryList;
                case self.state.preNightExt:
                    return [self.model().mainPackage.itineraryDays.find(x => x.isPreNight)];
                case self.state.postNightExt:
                    return [self.model().mainPackage.itineraryDays.find(x => x.isPostNight)];
                case self.state.preTourExt:
                    let preExt = self.extensionModels().find(x => x.isPreTour).itineraryDays;
                    return preExt ? preExt.map(x => { x.isExtension = true; return x; }) : [];
                case self.state.postTourExt:
                    let postExt = self.extensionModels().find(x => x.isPostTour).itineraryDays;
                    return postExt ? postExt.map(x => { x.isExtension = true; return x; }) : [];
            }
        }

        self.showItineraryCarousel = function (currentPackgage, price, mode) {
            var currItineraryDays = self.getCurrentItineraryDays();
            var firstDay = currItineraryDays.find(x => x.day >= 0);

            self.currentItinerary({
                hasPreNight: self.model().hasPreNight,
                hasPreTour: self.model().hasPreTour,
                hasPostNight: self.model().hasPostNight,
                hasPostTour: self.model().hasPostTour,
                totalBreakfast: currentPackgage.totalBreakfast,
                totalLunch: currentPackgage.totalLunch,
                totalDinner: currentPackgage.totalDinner,
                activityLevel: currentPackgage.activityLevel,
                ...firstDay
            });

            if (currItineraryDays.length > 1) {
                // init timeline
                self.timeline.removeAll();
                currItineraryDays.forEach(itd => {
                    itd.selectedDay = firstDay.day;
                    self.timeline.push(itd);
                })

                $(".timeline").show();
                $(".tcr-timeline-navigation").show();
            } else {
                $(".timeline").hide();
                $(".tcr-timeline-navigation").hide();
            }

            self.initToolbarView(self.model(), mode);
            self.initCoverView(firstDay, price);

        };

        self.initTimeline = function (timelines, currentMode, currentPackgage, price) {
            let itineraries = self.getCurrentItineraryDays();
            timelines.each(function () {
                var timeline = $(this),
                    timelineComponents = {};
                var eventsMinDistance = 5;
                //cache timeline components 
                timelineComponents['timelineWrapper'] = timeline.find('.events-wrapper');
                timelineComponents['eventsWrapper'] = timelineComponents['timelineWrapper'].children('.events');
                timelineComponents['fillingLine'] = timelineComponents['eventsWrapper'].children('.filling-line');
                timelineComponents['timelineEvents'] = timelineComponents['eventsWrapper'].find('a');
                timelineComponents['timelineNavigation'] = timeline.find('.tcr-timeline-navigation');
                timelineComponents['eventsContent'] = timeline.children('.events-content');
                self.setTransformValue(timelineComponents['eventsWrapper'].get(0), 'translateX', '0rem');

                var amountOfItineraryDays = itineraries.length - 1;
                var timelineWidth = (amountOfItineraryDays * 2.2 + 2) * eventsMinDistance + eventsMinDistance;

                $(".timeline-point").unbind();
                self.currentSelectedDay(0);
                self.setTimelineWidth(timelineComponents, timelineWidth);

                //detect click on the next arrow
                timelineComponents['timelineNavigation'].off('click', '.next').on('click', '.next', function (event) {
                    event.preventDefault();
                    if (event.target.classList.contains("inactive")) return;

                    let nextDay = self.currentSelectedDay() + 1;
                    let ele = $(`#tcr-timeline-point-${nextDay}`);

                    if (nextDay < $(".timeline-point").length && ele && ele.length > 0) {
                        ele && ele.click();
                        let stepDayLeftWidth = (ele[0]).style.left.replace('rem', '');
                        self.updateTimeline(timelineComponents, timelineWidth, 'next', +stepDayLeftWidth);
                    }
                });

                //detect click on the prev arrow
                timelineComponents['timelineNavigation'].off('click', '.prev').on('click', '.prev', function (event) {
                    event.preventDefault();
                    if (event.target.classList.contains("inactive")) return;

                    let prevDay = self.currentSelectedDay() - 1;
                    let ele = $(`#tcr-timeline-point-${prevDay}`);
                    if (prevDay >= 0 && ele && ele.length > 0) {
                        ele && ele.click();
                        let stepDayLeftWidth = (ele[0]).style.left.replace('rem', '');
                        self.updateTimeline(timelineComponents, timelineWidth, 'prev', +stepDayLeftWidth);
                    }

                    if (prevDay == 0) self.setTransformValue(timelineComponents['eventsWrapper'].get(0), 'translateX', '0rem');
                });

                //detect click on the a single event - show new event content
                timelineComponents['eventsWrapper'].off('click').on('click', 'a', function (event) {
                    event.preventDefault();
                    if (event.target.classList.contains('timeline-extension')) {
                        self.showExtension({ id: event.target.getAttribute("data-extension-type") });
                        return;
                    }

                    $(".timeline-point").removeClass("selected");
                    $(this).addClass('selected');
                    var selectedDate = Number(event.target.getAttribute("data-date") ?? 0);
                    var selectedIndex = Number(event.target.getAttribute("id").replace('tcr-timeline-point-', ''));
                    var newItinerary = itineraries.find(x => x.day == selectedDate);
                    self.currentSelectedDay(selectedIndex);

                    if (newItinerary) {
                        self.currentItinerary({ ...currentPackgage, ...newItinerary });
                        self.initCoverView(newItinerary, price);
                    }
                });
            });
        };

        self.showTimeline = function () {
            self.currentState(self.state.timeline);
            self.showItineraryCarousel(
                self.model().mainPackage,
                self.model().mainPackage.price,
                'main'
            );
            setTimeout(() => {
                self.initTimeline(
                    $('.cd-horizontal-timeline'),
                    'timeline',
                    self.model().mainPackage,
                    self.model().mainPackage.price);
            }, 500);

            $(".navigation-btn").removeClass("selected");
            $("#btnTimeline").addClass("selected");
            $(".tcr-itinerary-map").hide();
            $(".tcr-day-by-day").show();
            $(".cover-frame").show();
            $(".tcr-itinerary-cover").show();
        };

        self.showMap = function () {
            self.map({ mapImageUrl: self.model().mapUrl });
            $(".tcr-day-by-day").hide();
            $(".cover-frame").hide();
            $(".tcr-itinerary-cover").hide();
            $(".tcr-itinerary-map").show();
            $(".navigation-btn").removeClass("selected");
            $("#btnMap").addClass("selected");
        };

        self.showExtension = function (extensionVal) {
            let itineraries = [];
            let price = {};
            let pckage = {};
            let extensionKey = !!extensionVal ? extensionVal.id : '';

            if (!extensionKey) {
                if (self.model().hasPreNight) extensionKey = "prenight";
                if (self.model().hasPostNight) extensionKey = "postnight";
                if (self.model().hasPreTour) extensionKey = "pretour";
                if (self.model().hasPostTour) extensionKey = "posttour";
            }

            if (extensionKey == "pretour" || extensionKey == "posttour") {
                self.currentState(extensionKey == "pretour" ? self.state.preTourExt : self.state.postTourExt);

                pckage = self.extensionModels().find(x => extensionKey == "pretour" ? x.isPreTour : x.isPostTour);
                itineraries = pckage.itineraryDays;
                price = pckage.price;
            }
            if (extensionKey == "prenight" || extensionKey == "postnight") {
                self.currentState(extensionKey == "prenight" ? self.state.preNightExt : self.state.postNightExt);

                pckage = self.model().mainPackage;
                itineraries = [self.model().mainPackage.itineraryDays.find(x => extensionKey == "prenight" ? x.isPreNight : x.isPostNight)];
                price = itineraries[0].price;
            }

            self.showItineraryCarousel(pckage, price, 'extension');
            setTimeout(() => {
                self.initTimeline($('.cd-horizontal-timeline'), extensionKey, pckage, price);
            }, 500);

            $("#btnExtension").attr("data-mode", "hide");
            $("#showExtension").addClass("show");
            $("#hideExtension").removeClass("show");
            $("#extensions-list").hide();

            $(".extension-item").removeClass('selected');
            $(`#tcr-ext-${extensionKey}`).addClass('selected');

            $(".tcr-itinerary-map").hide();
            $(".tcr-day-by-day").show();
            $(".cover-frame").show();
            $(".tcr-itinerary-cover").show();
        };

        self.showFullItinerary = function () {
            var htmlString = self.model().mainPackage.itineraryDays.filter(x => !x.isExtension).map(pkg => {
                let culinary = [];
                if (pkg.breakfast) culinary.push('Breakfast');
                if (pkg.lunch) culinary.push('Lunch');
                if (pkg.dinner) culinary.push('Dinner');

                return `<p>Day: ${pkg.dayNumberDisplay}</p>`
                    + `<p class="mbt-10">${pkg.heading}</p>`
                    + `<p>${culinary.length > 0 ? culinary.join(' & ') : ''} ${self.convert(pkg.supplier?.name)}</p >`
                    + `<p>${pkg.description}</p>`
            });
            $('#fullItineraryContent')[0].innerHTML = htmlString.join('');
            $("#full_itinerary_modal")[0].style.display = 'block';
            $("#full_itinerary_modal .modal-content").scrollTop(0)
        };

        self.updateTimeline = function (timelineComponents, timelineWidth, step, stepDayLeftWidth) {
            let remToPixel = 10;
            let timelinePointWidth = 75 / remToPixel;
            let arrowWidth = 34 / remToPixel;
            let eventsMinDistance = 5;

            let eventsWrapper = timelineComponents['eventsWrapper'].get(0);
            let translateValue = self.getTranslateValue(timelineComponents['eventsWrapper']),
                wrapperWidth = Math.floor(Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')) / 11),
                currentPointExpand = stepDayLeftWidth + timelinePointWidth;

            let currentTimelineWidth = wrapperWidth + translateValue - arrowWidth;

            if (step == 'next' && currentPointExpand > currentTimelineWidth
                && Math.abs(translateValue - (remToPixel + eventsMinDistance)) <= (timelineWidth - eventsMinDistance)) {
                let transVal = translateValue - (remToPixel + eventsMinDistance);
                self.setTransformValue(eventsWrapper, 'translateX', transVal + 'rem');
            }
            if (step == 'prev' && currentPointExpand < Math.abs(translateValue)
                && (translateValue + (remToPixel + eventsMinDistance)) <= 0) {
                let transVal = (remToPixel + eventsMinDistance) + translateValue;
                self.setTransformValue(eventsWrapper, 'translateX', transVal + 'rem');
            }
        };
        self.setTimelineWidth = function (timelineComponents, totalWidth) {
            let remToPixel = 12;
            let wrapperWidth = Math.floor(Number(timelineComponents['timelineWrapper'].css('width').replace('px', '')) / remToPixel);

            if (wrapperWidth > totalWidth) {
                timelineComponents['timelineNavigation'].find('.next').css('left', totalWidth + 5 + 'rem')
            }
            else {
                let currentWidth = window.screen.width;
                timelineComponents['timelineNavigation'].find('.next').css('right', currentWidth <= 600 ? '1rem' : '4rem');
                timelineComponents['timelineNavigation'].find('.next').css('left', 'auto');
            }
            timelineComponents['eventsWrapper'].css('width', totalWidth + 'rem');
        };
        self.getTranslateValue = function (timeline) {
            let ele = $(timeline.get(0))[0];
            if (ele) {
                let transformProp = ele.style["transform"] || ele.style["-webkit-transform"] || ele.style["-moz-transform"]
                    || ele.style["-ms-transform"] || ele.style["-o-transform"];
                let translateValue = transformProp ? transformProp.replace('translateX(', '').replace('rem)', '') : 0;
                return Number(translateValue);
            }
            return 0;
        };
        self.setTransformValue = function (element, property, value) {
            element.style["-webkit-transform"] = property + "(" + value + ")";
            element.style["-moz-transform"] = property + "(" + value + ")";
            element.style["-ms-transform"] = property + "(" + value + ")";
            element.style["-o-transform"] = property + "(" + value + ")";
            element.style["transform"] = property + "(" + value + ")";
        };

        self.init = ko.computed(function () {
            let dataSource = ko.unwrap(self.data);
            if (dataSource == null) {
                $('.tcr-itinerary').hide();
                return;
            }

            let result = {
                extensionIds: dataSource.extensions.map(x => x.packageId),
                mainPackage: dataSource.package,
                hasPreTour: dataSource.hasPreTour,
                hasPostTour: dataSource.hasPostTour,
                hasPreNight: dataSource.hasPreNight,
                hasPostNight: dataSource.hasPostNight,
                mapUrl: dataSource.mapUrl
            };
            self.model(result);

            self.showItineraryCarousel(result.mainPackage, result.mainPackage.price, 'main');

            setTimeout(() => {
                self.initTimeline($('.cd-horizontal-timeline'),
                    'timeline',
                    result.mainPackage,
                    result.mainPackage.price);
            }, 500);

            $('.tcr-itinerary').show();
            $(".tcr-itinerary-map").hide();
            return result;
        });

        self.initExtension = ko.computed(function () {
            let dataSource = ko.unwrap(params.extensions);
            if (dataSource == null) {
                return;
            }
            self.extensionModels(dataSource);
            return dataSource;
        });
    }

    return TcrItineraryItemLayout;
});
