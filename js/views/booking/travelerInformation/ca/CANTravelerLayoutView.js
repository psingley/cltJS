define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'views/booking/travelerInformation/TravelerLayoutView',
    'views/booking/travelerInformation/ca/CANContactInfoView'
], function($, _, Backbone, Marionette, App, TravelerLayoutView, CANContactInfoView){
    var CANTravelerLayoutView = TravelerLayoutView.extend({
        setContactInfoRegion: function () {
            var contactInfo = this.model.get('contactInfo');
            this.contactInfoRegion.show(new CANContactInfoView(
                {
                    model: contactInfo,
                    travelerNumber: this.options.travelerNumber,
                    numberOfTravelers: this.options.numberOfTravelers
                }
            ));
        }
    });
    return CANTravelerLayoutView;
});