/**
 * View that defines all of the pres and posts on the booking engine
 * Nested view TourCustomizationStepLayout -> PrePostLayoutView
 *
 * @class PrePostLayoutView
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'app',
    'util/objectUtil',
    'collections/booking/tourCustomizations/BookingPackageUpgradeCollection',
    'views/booking/tourCustomizations/PrePostListView',
    'text!templates/booking/tourCustomizations/prePostLayoutTemplate.html'

], function ($, _, Backbone, Marionette, EventAggregator, App, ObjectUtil, PackageUpgradeCollection, PrePostListView, prePostLayoutTemplate) {
    var PrePostLayoutView = Backbone.Marionette.Layout.extend({
        template: Backbone.Marionette.TemplateCache.get(prePostLayoutTemplate),
        regions: {
            "presRegion": "#beforeTour",
            "postsRegion": "#afterTour",
            "extensionPreRegion": '#extensionBeforeTour',
            'extensionPostRegion': '#extensionAfterTour'
        },
        className: 'booking customizations extensions',
        templateHelpers: function () {
            var afterTourText = App.dictionary.get('tourRelated.Booking.TourCustomizations.AfterYourTour');
            var beforeTourText = App.dictionary.get('tourRelated.Booking.TourCustomizations.BeforeYourTour');

            return {
                afterTourText: afterTourText,
                beforeTourText: beforeTourText
            }
        },
        onShow: function () {
            //we use attach view here because show will overwrite everything in the region
            if (this.options.preExtensions.length != 0) {
                this.extensionPreRegion.show(new PrePostListView({collection: this.options.preExtensions}));
            } else {
            	this.hideSection(this.extensionPreRegion.el);                
            }

            if (this.options.postExtensions.length != 0) {
                this.extensionPostRegion.show(new PrePostListView({collection: this.options.postExtensions}));
            } else {
            	this.hideSection(this.extensionPostRegion.el);                
            }

            if (this.options.preUpgrades.length != 0) {
                this.presRegion.show(new PrePostListView({collection: this.options.preUpgrades}));
            } else {
            	this.hideSection(this.presRegion.el);                
            }

            if (this.options.postUpgrades.length != 0) {            	            	 
            	this.postsRegion.show(new PrePostListView({ collection: this.options.postUpgrades }));
            	//if ($("#afterTour input:enabled:visible").length == 0) {
		        //    this.hideSection(this.postsRegion.el);
	            //} need to discover option to call this code after show event
            } else {
            	this.hideSection(this.postsRegion.el);
            }

            //if we don't have any pre or posts don't show the entire region
            /*if (this.options.postUpgrades.length === 0 && this.options.preUpgrades.length === 0 && this.options.preExtensions.length === 0 && this.options.postExtensions.length === 0) {
                this.$el.closest('.section').hide();
            }*/
        },
        hideSection: function (element) {
        	$(element).hide();
        	$(element).prev().hide();
	    }

    });

    return PrePostLayoutView;
});