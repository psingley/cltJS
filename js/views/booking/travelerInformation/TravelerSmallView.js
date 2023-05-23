define([
    'jquery',
    'underscore',
    'backbone',
    'models/booking/travelerInformation/TravelerModel',
    'text!templates/booking/travelerInformation/travelerCheckBoxTemplate.html',
    'text!templates/booking/travelerInformation/travelerOptionTemplate.html',
    'event.aggregator',
    'app'
], function ($, _, Backbone, TravelerModel, travelerCheckBoxTemplate, travelerOptionTemplate, EventAggregator, App) {
    var TravelerSmallView = Backbone.Marionette.ItemView.extend({
        model: TravelerModel,
        templateHelpers: function () {
            return {
                travelerText: App.dictionary.get('tourRelated.Booking.TravelerInfo.Traveler'),
                nextTraveler: App.dictionary.get('tourRelated.Booking.TravelerInfo.NextTraveler'),
                travelerNumber: this.options.index + 1
            }
        },
        initialize: function () {
            this.model.on('change', this.render, this);
            switch (this.options.type) {
                case 'checkbox':
                    this.template = Backbone.Marionette.TemplateCache.get(travelerCheckBoxTemplate);
                    break;
                case 'dropdown':
                    this.template = Backbone.Marionette.TemplateCache.get(travelerOptionTemplate);
                    this.tagName = 'option';
                    break;
                default:
                    this.template = Backbone.Marionette.TemplateCache.get(travelerCheckBoxTemplate);
                    break;
            }
        },
        tagName: function () {
            switch (this.options.type) {
                case 'dropdown':
                    return 'option';
                default:
                    return 'div';
            }
        },
        onBeforeRender: function () {
            if (this.options.type === 'checkbox') {
                var $checkbox = this.$el.find('input');
                //current state of 'traveler checkbox'
                this.check = $checkbox.prop('checked');
            }
        },
        onRender: function () {
            if (this.options.type === 'dropdown') {
                this.$el.attr('value', this.options.index + 1);
                this.$el.attr('data-id', this.model.get('id'));
            }
            else if (this.options.type === 'checkbox') {
                var $checkbox = this.$el.find('input');
                //restore current state of 'traveler checkbox'
                $checkbox.prop('checked', this.check);
            }
        },
        onShow: function () {
            if (this.options.type === 'checkbox') {
                var $checkbox = this.$el.find('input');
                //'traveler checkbox' is checked by default
                $checkbox.prop('checked', true);
            }
        }
    });

    return TravelerSmallView;
});