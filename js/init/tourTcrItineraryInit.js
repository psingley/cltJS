define([
    'knockout',
    'jquery',
    'moment',
],
    function (ko, $, moment) {
        function TourItineraryModule() {
            var self = this;
            self.itineraries = ko.observable(null);
            self.extensions = ko.observableArray([]);
            self.currencyCode = '';
            self.currentActivityLevel = '';
            self.sharedURL = document.location.href;
            self.isCopied = ko.observable(false);

            self.activityLevels = ko.observableArray([]);
            self.travelStyles = ko.observableArray([]);

            var _activityLevel = parseInt($("#newTourDetails").attr('data-activity-level'));
            if ((_activityLevel !== undefined) && (_activityLevel !== null)) {
                self.currentActivityLevel = _activityLevel;
            }

            var _siteSettings = JSON.parse($("#siteSettings")[0].value);
            if ((_siteSettings !== undefined) && (_siteSettings !== null)) {
                self.currencyCode = _siteSettings.currencyCode;
            }

            self.getTcrExtensionItineraries = function (package) {
                var data = { packageUpgradeId: package.packageId, currencyCode: self.currencyCode };

                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    url: '/api/services/TourDetailsService/GetTcrPackageUpgrade',
                    error: function (errorResponse) {
                        console.log(errorResponse.responseText);
                    },
                    success: function (result) {
                        let pck = result.package;
                        pck.isPreTour = package.isPreTour;
                        pck.isPostTour = package.isPostTour;
                        pck.price = package.price;
                        self.extensions().push(pck);
                    }
                });
            }

            self.getTcrItineraries = function () {
                let packageId = $("#newTourDetails") && $("#newTourDetails").length > 0 ? $("#newTourDetails")[0].dataset.packageid : 0
                let packageDateId = $("#newTourDetails") && $("#newTourDetails").length > 0 ? $("#newTourDetails")[0].dataset.packagedateid : 0;

                if (!packageId) {
                    packageId = new URLSearchParams(window.location.search).get('packageid');
                }
                if (!packageDateId) {
                    packageDateId = new URLSearchParams(window.location.search).get('packagedateid');
                }

                var data = { packageId: packageId, packageDateId: packageDateId, currencyCode: self.currencyCode };

                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    url: '/api/services/TourDetailsService/GetTcrTourItineraries',
                    error: function (errorResponse) {
                        console.log(errorResponse.responseText);
                    },
                    success: function (result) {
                        if (!!result && !!result.package && !!result.package.itineraryDays && result.package.itineraryDays.length > 0) {
                            self.itineraries(result);

                            if (result.extensions.length > 0) {
                                for (let i = 0; i < result.extensions.length; i++) {
                                    self.getTcrExtensionItineraries(result.extensions[i]);
                                };
                            }
                        }

                        console.log(self.itineraries());
                    }
                });
            }

            self.getActivityLevels = function (data) {
                if (self.activityLevels().length == 0) {
                    $.ajax({
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        url: '/api/services/TourDetailsService/GetActivityLevels',
                        error: function (errorResponse) {
                            console.log(errorResponse.responseText);
                        },
                        success: function (result) {
                            if (!!result) {
                                self.activityLevels(result);
                            }
                        }
                    });
                }

            }

            self.getTravelStyles = function (data) {

                if (self.travelStyles().length == 0) {

                    $.ajax({
                        type: "POST",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        url: '/api/services/TourDetailsService/GetTravelStyles',
                        error: function (errorResponse) {
                            console.log(errorResponse.responseText);
                        },
                        success: function (result) {
                            if (!!result) {
                                self.travelStyles(result);

                                console.log("Travel Styles: " + self.travelStyles()[0].description);

                            }

                        }
                    });
                }

            }

            self.getTcrItineraries();


            self.showShareModal = function () {
                if (!!addthis) {
                    addthis.init();
                }
                $("#share_itinerary_modal")[0].style.display = 'block';
            }

            self.showPrintModal = function () {
                $("#print_itinerary_modal")[0].style.display = 'block';
            };

            self.hideModal = function () {
                for (let idx = 0; idx < $(".tcr-itinerary-modal").length; idx++) {
                    $(".tcr-itinerary-modal")[idx].style.display = 'none';
                }
            };

            self.showShareContent = function (shareType) {
                $(".tcr-share-tab").removeClass("tcr-share-tab-selected");
                $(".tcr-share-details").addClass("no-show");
                switch (shareType) {
                    case 'email':
                        $(".tcr-share-email-content fieldset").removeClass("form-columns-2");
                        $(".tcr-share-email-content").removeClass("no-show");
                        $(".tcr-share-email-tab").addClass('tcr-share-tab-selected');
                        break;
                    case 'url':
                        $(".tcr-share-url-content").removeClass("no-show");
                        $(".tcr-share-url-tab").addClass('tcr-share-tab-selected');
                        break;
                    case 'social':
                    default:
                        $(".tcr-share-social-content").removeClass("no-show");
                        $(".tcr-share-social-tab").addClass('tcr-share-tab-selected');
                        break;
                }
            }

            self.shareViaSocial = function (type) {
                switch (type) {
                    case "facebook":
                        $(".at-svc-facebook")[0].click();
                        break;
                    case "linkedin":
                        $(".at-svc-linkedin")[0].click();
                        break;
                    case "twitter":
                        $(".at-svc-twitter")[0].click();
                        break;
                    case "pinterest":
                        $(".at-svc-pinterest_share")[0].click();
                        break;
                }
            }

            self.copyUrlToClipboard = function () {
                $("#tcr-share-url")[0].select();
                document.execCommand("copy");
                if (!self.isCopied()) {
                    self.isCopied(true);
                    setTimeout(() => { self.isCopied(false); }, 1500);
                }
            }

            self.packageDate = ko.computed(function () {
                if ($("#newTourDetails").length > 0) {
                    return $("#newTourDetails")[0].dataset.startdateformatted;
                }
                return '';
            });

            $("#tcr-view-posttour").bind("click", function () {
                $('#tcr-ext-posttour')[0].click();
                $('.tcr-menu')[0].scrollIntoView();
            });

            $("#tcr-view-pretour").bind("click", function () {
                $('#tcr-ext-pretour')[0].click();
                $('.tcr-menu')[0].scrollIntoView();
            });
        }

        $(document).ready(function () {
            var vm = new TourItineraryModule();

            var initInterval = setInterval(function () {
                let rootEle = $('#new-tour-itinerary');
                if (!!rootEle && rootEle.length == 1) {
                    clearInterval(initInterval);

                    ko.components.register('tcr-itinerary-layout', {
                        viewModel: { require: 'renderedLayouts/tourDetailPage/tcrItineraries/TcrItineraryItemLayout' },
                        template: { require: 'text!templates/tourDetailPage/tcrItineraries/tcrItineraryLayoutTemplate.html' }
                    });

                    ko.components.register('tcr-itinerary-day', {
                        viewModel: { require: 'views/tourDetailPage/tcr-itinerary/TcrItineraryDayItemView' },
                        template: { require: 'text!templates/tourDetailPage/tcrItineraries/tcrItineraryDayItemTemplate.html' }
                    });

                    ko.components.register('tcr-itinerary-timeline', {
                        viewModel: { require: 'views/tourDetailPage/tcr-itinerary/TcrItineraryTimelineView' },
                        template: { require: 'text!templates/tourDetailPage/tcrItineraries/tcrItineraryTimelineTemplate.html' }
                    });

                    ko.components.register('tcr-itinerary-map', {
                        viewModel: { require: 'views/tourDetailPage/tcr-itinerary/TcrMapView' },
                        template: { require: 'text!templates/tourDetailPage/tcrItineraries/tcrMapTemplate.html' }
                    });

                    ko.components.register('tcr-itinerary-cover', {
                        viewModel: { require: 'views/tourDetailPage/tcr-itinerary/TcrItineraryCoverView' },
                        template: { require: 'text!templates/tourDetailPage/tcrItineraries/tcrItineraryCoverTemplate.html' }
                    });

                    ko.components.register('tcr-itinerary-toolbar', {
                        viewModel: { require: 'views/tourDetailPage/tcr-itinerary/TcrItineraryToolbarView' },
                        template: { require: 'text!templates/tourDetailPage/tcrItineraries/tcrItineraryToolbarTemplate.html' }
                    });

                    ko.cleanNode($('#new-tour-itinerary'));
                    ko.applyBindings(vm, $('#new-tour-itinerary')[0]);

                    var hash = window.location.hash;
                    if (hash == "#new-tour-itinerary") {
                        console.log("hash: " + hash);
                        window.location.hash = '';
                        window.location.hash = hash;
                    }

                    let linx = document.querySelectorAll('div.tour-options__details a');

                    linx.forEach((l) => {
                        l.setAttribute('data-bs-toggle', 'modal');
                    });

                }
            }, 1000);

            let initTourInterval = setInterval(function () {
                let rootEle = $('.tour-summary-init');
                if (!!rootEle && rootEle.length == 1) {
                    clearInterval(initTourInterval);
                    ko.cleanNode($('.tour-summary-init'));
                    ko.applyBindings(vm, $('.tour-summary-init')[0]);
                }
            }, 1000);

            $(window).click(function (e) {
                if (e.target.id !== 'btnExtension' && e.target.parentElement.id !== 'btnExtension'
                    && $(".extensions-list").length > 0 && $(".extensions-list").is(":visible"))
                {
                    $("#btnExtension").attr("data-mode", "hide");
                    $("#showExtension").addClass("show");
                    $("#hideExtension").removeClass("show");
                    $("#extensions-list").hide();
                }
            });
        })
    }
);
