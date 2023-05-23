define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'event.aggregator',
    'util/tourDetailUtil',
    'util/offersUtil',
    'views/tour/tourDates/TourDateView',
    'text!templates/tour/tourDates/monthContentTemplate.html',
    'collections/tour/tourDates/TourDateCollection'
], function ($, _, Backbone, Marionette, App, EventAggregator, TourDetailUtil, OffersUtil, TourDateView, MonthContentTemplate,TourDateCollection) {
    var TourDateListView = Backbone.Marionette.CompositeView.extend({
        collection: TourDateCollection,
        itemView: TourDateView,
        template: Backbone.Marionette.TemplateCache.get(MonthContentTemplate),
        tagName:"div",
        itemViewContainer:'tbody',
        initialize: function(input){
            this.model = input.model;
            this.collection = input.model.get("dates");
        },
        templateHelpers: function() {
            var ebbDiscount = OffersUtil.findEbb(this.collection);
            var vanityCode = ebbDiscount== undefined ? "" : OffersUtil.getCurrentVanity(ebbDiscount);
            return {
                bookByText: function(){
                    if (ebbDiscount == undefined){
                        return "";
                    }
                    var text;
                    if (vanityCode != ""){
                        text = App.dictionary.get("tourRelated.FreeFormText.BookBy");
                        text = text.replace("@@VanityCode@@", OffersUtil.getCurrentVanity(ebbDiscount));
                    }
                    else{
                        text = App.dictionary.get("tourRelated.FreeFormText.BookByWithoutVanity");
                    }

                    text = text.replace("@@Amount@@", App.siteSettings.currencySymbol + TourDetailUtil.formatNumberWithCommas(ebbDiscount.offerRate));
                    text = text.replace("@@ExpirationDate@@", OffersUtil.getOfferExpirationDate(ebbDiscount));

                    return text;
                },
                showEbb: ebbDiscount != undefined && vanityCode != ""
            }
        }
    });
    // Our module now returns our view
    return TourDateListView;
});
