define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'text!templates/booking/travelerInformation/thomasCook/tcTravelerLayoutTemplate.html',
    'views/booking/travelerInformation/TravelerLayoutView',
    'views/booking/travelerInformation/thomasCook/TCContactInfoView'
], function($, _, Backbone, Marionette, App, tcTravelerLayoutTemplate, TravelerLayoutView, TCContactInfoView){
    var TCTravellerLayoutView = TravelerLayoutView.extend({
        template: Backbone.Marionette.TemplateCache.get(tcTravelerLayoutTemplate),
        initialize: function(){
            TCTravellerLayoutView.__super__.initialize.apply(this);
        },
        setContactInfoRegion: function () {
            var contactInfo = this.model.get('contactInfo');
            this.contactInfoRegion.show(new TCContactInfoView(
                {
                    model: contactInfo,
                    travelerNumber: this.options.travelerNumber,
                    numberOfTravelers: this.options.numberOfTravelers
                }
            ));
        }
    });
    return TCTravellerLayoutView;
});