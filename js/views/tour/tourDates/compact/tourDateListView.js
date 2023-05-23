define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/tourDetailUtil',
    'util/offersUtil',
    'views/tour/tourDates/compact/TourDateView',
    'text!templates/tour/tourDates/tourYearGroupTemplate.html',
    'collections/tour/tourDates/TourDateCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourDetailUtil, OffersUtil, TourDateView, MonthContentTemplate,TourDateCollection) {
    var TourDateListView = Backbone.Marionette.CompositeView.extend({
        collection: TourDateCollection,
        itemView: TourDateView,
        template: Backbone.Marionette.TemplateCache.get(MonthContentTemplate),
        tagName:"div",
        itemViewContainer:'ol',
        initialize: function (input) {
            this.model = input.model;
            this.collection = input.model.get("dates");
        },
        templateHelpers: function() {          
            //var vanityCode = ebbDiscount == undefined ? "" : OffersUtil.getCurrentVanity(ebbDiscount);
            var showDiscountMessage = this.model.get("discountMessage") != null && this.model.get("discountMessage") != "";
	        return {
	        	discountMessage: this.model.get("discountMessage"),                
	        	showDiscount: showDiscountMessage
            }
        },
        onRender: function () {
        	this.$el.attr("id", this.model.get("year") + "-dates");
        	if (this.options.active) {
        	    this.$el.attr("class", "dates-pane tab-pane active");
        	}
        	else {
        		this.$el.attr("class", "dates-pane tab-pane");        		        		 
        	}
        	//this.$el.attr("data-toggle", "tab");        	
        	this.$el.attr("role", "tabpanel");        	
        }
    });
    // Our module now returns our view
    return TourDateListView;
});
