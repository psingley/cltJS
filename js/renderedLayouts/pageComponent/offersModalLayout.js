define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'moment'
], function ($, _, Backbone, Marionette, App, moment) {
    var OffersModalLayout = Backbone.Marionette.Layout.extend({
        el: "#special-offers-modal",
        ui:{
            disclaimer: ".disclaimer-text"
        },
        initialize: function() {
            App.offersModalTextTemplate = $(this.ui.disclaimer).text();

            if (this.options.vanity != null) {
                this.updateDisclaimer(this.options.vanity);
            }
        },
        updateDisclaimer: function(vanity){
            var text = App.offersModalTextTemplate;
            text = text.replace('$offercode', vanity.vanityCode);
            text = text.replace('$offerstartdate', moment(vanity.startDate).format(App.siteSettings.dateFormat));
            text = text.replace('$offerenddate',  moment(vanity.endDate).format(App.siteSettings.dateFormat));
            $(this.ui.disclaimer).text(text);
        }
    });
    return OffersModalLayout;
});