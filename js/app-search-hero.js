define(['jquery', 'knockout', 'app','util/objectUtil'], function ($,ko,App, ObjectUtil) {

    return function appViewModel() {

        var self = this;
        self.error = ko.observable();

        self.locationDetail = ko.observable();
        self.heroDestinationImage = ko.observable();
        self.heroDestinationSummary = ko.observable();
        self.heroMustDoImage = ko.observable();
        self.heroMustDoHeading = ko.observable();
        self.heroMustDoSummary = ko.observable();
        self.locationName = ko.observable();
        self.locationLink = ko.observable();
        self.language = ko.observable();
        self.siteSettings = ko.observable();

        var anchor = window.location.hash;
        var paramList = ko.observableArray();

        var searchList = ko.observableArray();
        if (!ObjectUtil.isNullOrEmpty(anchor) &&
            (anchor.includes('content') || anchor.includes('continentnames') || anchor.includes('countrynames') || anchor.includes('regionnames'))) {

            anchor = anchor.replace('#q/', '');
            paramList = anchor.split('&');

            if (paramList.length > 0) {
                for (var i = 0; i < paramList.length; i++) {
                    var key = paramList[i].split('=');
                    if (key.includes('content')) {
                        this.searchTerm = key[1];
                        this.searchTermType = 'content';
                    }
                    else if (key.includes('continentnames')) {
                        this.searchTerm = key[1];
                        this.searchTermType = 'Continent';
                    }
                    else if (key.includes('countrynames')) {
                        this.searchTerm = decodeURIComponent(key[1]);
                        this.searchTermType = 'Country';
                    }
                    else if (key.includes('regionnames')) {
                        this.searchTerm = key[1];
                        this.searchTermType = 'Region';
                    }
				}
            }

            
            if (!ObjectUtil.isNullOrEmpty(this.searchTerm)) {

                var siteSettings = $('#siteSettings').val();
                self.siteSettings(siteSettings);
                self.language($.parseJSON(self.siteSettings()).language);

                var parameters = { locName: this.searchTerm, locType: this.searchTermType, language: self.language() };
                ajaxHelper('/api/services/LocationDetail/GetLocationsIndexData', 'POST', parameters).done(function (data, status, xhr) {

                    self.locationDetail(data);
                    //console.log(self.locationDetail().heroDestinationImage);
                    self.locationName(self.locationDetail().locationName);
                    self.locationLink(self.locationDetail().locationLink);
                    self.heroDestinationImage("url('" + self.locationDetail().heroDestinationImage + "')");
                    self.heroDestinationSummary(self.locationDetail().heroDestinationSummary);
                    self.heroMustDoImage("url('" + self.locationDetail().mustDoImage + "')");
                    self.heroMustDoHeading(self.locationDetail().mustDoHeading);
                    self.heroMustDoSummary(self.locationDetail().mustDoSummary);
                });
            }
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
    }
});





