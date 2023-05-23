
define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/travelerInformation/TravelerModel',
    'models/booking/travelerInformation/ContactInfoModel',
    'text!templates/booking/rooms/travelerSmallRoomTemplate.html',
    'event.aggregator',
    'app',
    'util/travelerUtil'
], function ($, _, Backbone, TravelerModel, ContactInfoModel, travelerSmallLayoutTemplate, EventAggregator, App,  TravelerUtil) {
    var TravelerSmallRoomView = Backbone.Marionette.ItemView.extend({
        model: TravelerModel,
        template: Backbone.Marionette.TemplateCache.get(travelerSmallLayoutTemplate),
        events: {
            'blur .emailTravelerName': 'validateBlur',
            'blur .firstTravelerName': 'validateBlur',
            'blur .lastTravelerName': 'validateBlur',
            'keyup  .emailTravelerName': 'validateBlur'
           
        },
        templateHelpers: function () {
            var outerScope = this;
            return {
                travelerText: App.dictionary.get('tourRelated.Booking.TravelerInfo.Traveler'),
                travelerIndex: this.options.travelerNumber,
                cid: this.model.cid,
                firstName: outerScope.model.get('firstName'),
                lastName: outerScope.model.get('lastName'),
                personPrice: this.model.get('price'),
                currencyCode: App.siteSettings.currencyCode
            }
        },
        initialize: function () {
            var x = $('div.price');
            this.model.set('placeholderText', 'Guest ' + this.options.travelerNumber);
            this.model.on('change', this.render, this);
        },
        changeMe: function (e) {

            // Changed to use initialize this.render
            //$('span.showPrice').html(this.model.get('price').toString().formatPrice() + ' ' + App.siteSettings.currencyCode);
    
        },
        getPersonPrice: function () {
           //console.log(this.model.get('price').toString().formatPrice());
        },
        validateBlur: function (e) {
            //validate current input field
            TravelerUtil.ValidateBlur(e);
              if (e.currentTarget.validity.valid) {
                  this.saveTravelerInfo(e);
              }
        },
        saveTravelerInfo: function (e) {  
            e.preventDefault();
            TravelerUtil.AddNewContacts('.aTraveler', 'input.firstTravelerName', 'input.lastTravelerName', 'input.emailTravelerName');
            //this.model.set({ firstName: e.currentTarget.parentElement.parentElement.parentElement.querySelector('input.firstTravelerName').value });
            //this.model.set({ lastName: e.currentTarget.parentElement.parentElement.parentElement.querySelector('input.lastTravelerName').value });
            //EventAggregator.trigger('travelersUpdated');
            //document.querySelectorAll("input[name='firstName']")[0].value = JSON.parse(localStorage.getItem('newContacts'))[0].Firstname;
            TravelerUtil.FillPartialTraveler();
        }
    });
    return TravelerSmallRoomView;
});