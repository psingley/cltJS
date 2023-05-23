define([
    'knockout',
    'jquery',
    'bootstrap',
],
    function (ko, $, Bootstrap) {
        function TourDateSelectorModule() {
            var self = this;

            self.error = ko.observable();

            self.siteSettings = ko.observable();
            self.language = ko.observable();
            self.landingPageId = ko.observable();
            self.currencySymbol = ko.observable();
            self.currencyCode = ko.observable();
            self.startDateYear = ko.observable();

            self.tourDateItems = ko.observableArray();
            self.tourDateFilters = ko.observableArray();
            self.currentFilter = ko.observable();
            self.currentRow = ko.observable();
            self.packageDateNeoId = ko.observable();
            self.packageDateItemId = ko.observable();
            self.packageNeoId = ko.observable();


            var siteSettings = $('#siteSettings').val();
            self.siteSettings(siteSettings);

            self.language($.parseJSON(self.siteSettings()).language);
            self.landingPageId($('#landingPageId').val());
            self.currencySymbol($.parseJSON(self.siteSettings()).currencySymbol);
            self.currencyCode($.parseJSON(self.siteSettings()).currencyCode);

            self.packageDateNeoId($('#packageDateNeoId').val());
            self.packageNeoId($('#packageNeoId').val());
            self.packageDateItemId($('#packageDateItemId').val());
            self.startDateYear($('#startDateYear').val());

            console.log(self.language());


            self.selectFilter = function (data) {

                self.currentFilter(data);
                console.log(self.currentFilter());

            }


            self.tourDatesFiltered = ko.computed(function () {

                if (self.currentFilter() != "Special Events") {
                    return self.tourDateItems().filter(function (i) {
                        return i.departureYear == self.currentFilter();
                    });
                }
                else {
                    return self.tourDateItems().filter(function (i) {
                        return i.hasSpecialEvent == true;
                    });

                }
            });

            self.selectTourDateRow = function (data) {
                self.currentRow(data.packageDateNeoId);
                self.packageDateNeoId(data.packageDateNeoId);
                self.packageDateItemId(data.packageDateItemId);
                self.packageNeoId(data.packageNeoId);

                console.log("self.packageDateItemId(): " + self.packageDateItemId());

            }

            self.tourDateRowSelected = function (data) {

                var selected = false;
                self.tourDatesFiltered().forEach(function (v, i) {

                    if (data.packageDateNeoId == self.currentRow()) {
                        console.log("bingo this row is selected: " + data);
                        selected = true;
                    }

                });

                return selected;

            }

            self.packageDateStatus = function (data) {

                return data.soldOut ? "package-status-unavailable" : "package-status-available";

            }


            self.getTourDateItems = function () {

                console.log("Retrieving tour date items...");
                var parameters = { language: self.language(), landingpageid: self.landingPageId(), sitesettings: self.siteSettings() };

                ajaxHelper('/api/services/TourDateService/GetTourDateItems', 'POST', parameters).done(function (data, status, xhr) {

                    self.currentRow(self.packageDateNeoId());
                    self.tourDateItems(data.tourDateItems);
                    self.tourDateFilters(data.tourDateFilters);
                    self.currentFilter(self.startDateYear());
                    console.log(data);

                });

                console.log("Finished retrieving tour date items...");

            }

            self.viewItinerary = function () {

                var currentDomain = document.location.host;
                var currentProtocol = document.location.protocol;
                var tourPageUrl = $('#tourPageUrl').val();
                var url = currentProtocol + '//' + currentDomain + tourPageUrl + "?packagedateid=" + self.packageDateNeoId() + "&packageid=" + self.packageNeoId() + "#new-tour-itinerary";
                console.log(url);

                //hide the modal
                $("#DatePickerModal .btn-close").click()
                
                window.location.href = url;
                                
            }

            self.bookNow = function () {

                var currentDomain = document.location.host;
                var currentProtocol = document.location.protocol;
                var bookingPageUrl = $('#bookingPageUrl').val();
                var url = currentProtocol + '//' + currentDomain + bookingPageUrl + "&packageDate=" + self.packageDateItemId();
                console.log("bookingPageUrl: " + url);

                window.open(url, '_blank');

            }


            function ajaxHelper(uri, method, data) {


                self.error(''); // Clear error message
                return $.ajax({
                    type: method,
                    url: uri,
                    dataType: 'json',
                    contentType: 'application/json',
                    data: data ? JSON.stringify(data) : null
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    self.error(errorThrown);
                });

            }

            self.getTourDateItems();

        }
        $(document).ready(function () {


            var vm = new TourDateSelectorModule();
            console.log("Set the vm right now");
            ko.cleanNode($('#viewDates'));
            ko.applyBindings(vm, $('#viewDates')[0]);


        })


    }
);
