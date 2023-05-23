define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/booking/tourCustomizations/BookingPackageUpgradeModel',
    'text!templates/booking/tourCustomizations/additionalFeesTemplate.html',
    'views/booking/tourCustomizations/BasePackageUpgradeView'
], function ($, _, Backbone, Marionette, App, PackageUpgradeModel, additionalFeesTemplate, BasePackageUpgradeView) {
    var AdditionalFeesView = BasePackageUpgradeView.extend({
        model: PackageUpgradeModel,
        template: additionalFeesTemplate,
        className: 'additional-fee',
        templateHelpers: function () {
            var outerScope = this;
            return {
                nightsIncludedText: App.dictionary.get('tourRelated.Booking.TourCustomizations.NightsIncluded'),
                currencySymbol: App.siteSettings.currencySymbol,
                isTransfer: function () {
                    var serviceType = outerScope.model.get('serviceType');
                    if (serviceType.id == App.taxonomy.getId('serviceTypes', 'Transfer')) {
                        return true;
                    }

                    return false;
                }
            }
        },
        onShow: function(){
            //make sure the checkbox is disabled
            this.$checkbox.prop('disabled', true);
        }
    });

    return AdditionalFeesView;
});