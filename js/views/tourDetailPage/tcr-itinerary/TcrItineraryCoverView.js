define([
    'knockout',
    'jquery',
], function (ko, $) {
    function TcrItineraryCoverView(params) {
        let self = this;
        self.convert = function (rawData) {
            return rawData !== null && rawData !== undefined ? rawData : '';
        }

        self.data = params.data;
        self.model = ko.computed(function () {
            let dataSource = ko.unwrap(self.data);
            if (dataSource == null) return {};

            $("#tcr-itinerary-cover").show();
            return dataSource;
        });

        self.coverImageUrl = ko.computed(function () {
            return self.model().coverImageUrl;
        });

        self.isExtension = ko.computed(function () {
            return self.model().isExtension || false;
        });

        self.price = ko.computed(function () {
            let currencySymbol = self.convert(JSON.parse($("#siteSettings")[0].value)?.currencySymbol);
            return currencySymbol + "" + (self.model().price ? self.model().price.price : 0);
        });

        self.pptext = ko.computed(function () {
            let pricePointSymbol = self.convert( JSON.parse($("#siteSettings")[0].value)?.pricePointSymbol);
            return pricePointSymbol + "*";
        });

        self.currentMode = ko.computed(function () {
            return self.convert(self.model().currentExtensionLabel);
        });
    }
    return TcrItineraryCoverView;
});
