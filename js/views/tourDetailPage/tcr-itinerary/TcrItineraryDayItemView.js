define([
    'knockout',
    'jquery',
], function (ko, $) {
    function TcrItineraryDayItemView(params) {
        let self = this;

        self.activityContent = 'You’re an on-the-go traveler. You don’t want to miss a thing, so walking and standing for longer periods of time (1-2 hours) isn’t a big deal. You can navigate hills and uneven ground, climb into various modes of transportation (tuk-tuk, cable car, zodiac, etc.), and could possibly anticipate changes in elevation. You can expect some longer days balanced with free time to recharge or set out on your own adventure.';
        self.data = params.data;
        self.model = ko.computed(function () {
            let dataSource = ko.unwrap(self.data);
            if (dataSource == null) return;

            return dataSource;
        });

        self.day = ko.computed(function () {
            return self.model().day;
        });

        self.title = ko.computed(function () {
            var headingTitle = "Day " + self.model().dayNumberDisplay + ": " + self.model().heading;
            if (self.model().isPreNight)
                headingTitle = "Pre-Night" + ": " + self.model().supplier.city;
            if (self.model().isPostNight)
                headingTitle = "Post-Night" + ": " + self.model().supplier.city;

            return headingTitle;
        });
        self.supplierName = ko.computed(function () {
            return self.model().supplier?.name || '';
        });
        self.supplierSiteUrl = ko.computed(function () {
            var siteUrl = self.model().supplier?.websiteUrl || '';
            if (!siteUrl) return '';

            var hasHttp = siteUrl.indexOf("http") >= 0 || siteUrl.indexOf("https") >= 0;
            if (hasHttp) return siteUrl;

            return 'https://' + siteUrl.replace('https://', '');
        });
        self.activityLevel = ko.computed(function () {
            return self.model().activityLevel || '';
        });

        self.description = ko.computed(function () {
            if (self.model().isPreNight)
                return "Get a head start … add a pre - tour overnight stay at " + self.model().supplier?.name + ".";
            if (self.model().isPostNight)
                return "Keep the good times going … add a post - tour overnight stay at " + self.model().supplier?.name + ".";
            return self.model().description?.replace(/(<([^>]+)>)/ig, '');
        });

        self.showEnhanceTour = ko.computed(function () {
            return self.model().showEnhanceTour != null && (self.model().showEnhanceTour || false);
        });
        self.includeMeals = ko.computed(function () {
            return self.model().breakfast || self.model().lunch || self.model().dinner;
        });
        self.showExtensionStyle = ko.computed(function () {
            return self.model().isExtension && !!(self.model().extensionType);
        });
        self.showActivity = ko.computed(function () {
            return !!(self.model().activityLevel || '');
        });
        self.showSupplier = ko.computed(function () {
            return !!self.model().supplier && self.model().supplier != {} && !!self.model().supplier.name;
        });

        self.itineraryCulinerary = ko.computed(function () {
            let culinary = [];
            if (self.model().breakfast) culinary.push('Breakfast');
            if (self.model().lunch) culinary.push('Lunch');
            if (self.model().dinner) culinary.push('Dinner');
            return culinary.length > 0 ? culinary.join(' & ') : '';
        });
        self.enhanceTourOptions = ko.computed(function () {
            let options = [];
            if (self.model().showExcursions) options.push('Excursions');
            if (self.model().showChoiceOnTour) options.push('Choice On Tour');
            return options;
        });

        self.totalBreakfast = ko.computed(function () {
            return `${self.model().totalBreakfast} Breakfast${self.model().totalBreakfast > 1 ? 's' : ''} `;
        });
        self.totalLunch = ko.computed(function () {
            return `${self.model().totalLunch} Lunch${self.model().totalLunch > 1 ? 's' : ''} `;
        });
        self.totalDinner = ko.computed(function () {
            return `${self.model().totalDinner} Dinner${self.model().totalDinner > 1 ? 's' : ''} `;
        });
        self.modalId = ko.computed(function () {
            return 'tcr_activity_modal_' + self.model().day;
        });
        self.extensionStyle = ko.computed(function () {
            return (self.model().extensionType || "Independent");
        });
    }
    return TcrItineraryDayItemView;
});
