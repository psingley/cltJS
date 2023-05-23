define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'text!templates/booking/tourCustomizations/tourAdditionalFeesTemplate.html',
    'views/booking/tourCustomizations/BasePackageUpgradeView'
], function ($, _, Backbone, Marionette, App, PackageUpgradeModel, tourAdditionalFeesTemplate, BasePackageUpgradeView) {
    var TourAdditionalFeesView = BasePackageUpgradeView.extend({
        model: PackageUpgradeModel,
        template: tourAdditionalFeesTemplate,
        tagName: 'tr',
        templateHelpers: function () {
            var outerScope = this;
            return {
                currencySymbol: App.siteSettings.currencySymbol,
                currencyCode: App.siteSettings.currencyCode,
                isInternalAir: function () {
                    var serviceType = outerScope.model.get('serviceType');
                    var serviceTypeDetail = outerScope.model.get('serviceTypeDetail');
                    var x = (serviceType.id == App.taxonomy.getId('serviceTypes', 'Air') &&
                        serviceTypeDetail.id == App.taxonomy.getId('serviceTypeDetails', 'Internal'));

                    return x;
                },
                getInternalAirPrice: function () {
                    var price = outerScope.model.get('price');
                    var quantity = outerScope.model.get('quantity');
                    if (price > 0 && quantity > 0) {
                        return price * quantity;
                    }
                },
                isTransfer: function () {
                    var serviceType = outerScope.model.get('serviceType');
                    if (serviceType.id == App.taxonomy.getId('serviceTypes', 'Transfer')) {
                        return true;
                    }

                    return false;
                }
            }
        }
    });

    return TourAdditionalFeesView;
});