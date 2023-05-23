define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/objectUtil',
    'util/tourDetailUtil',
    'models/tour/availableOffers/AvailableOffersModel',
    'text!templates/tour/availableOffers/hotDealTemplate.html',
    'util/htmlUtil'
], function ($, _, Backbone, Marionette, App, ObjectUtil, TourDetailUtil, AvailableOffersModel, hotDealTemplate, HtmlUtil) {
	var HotDealItemView = Backbone.Marionette.ItemView.extend({
        model: AvailableOffersModel,
        tagName: "div",
        className: "col-sm-6",
        template: Backbone.Marionette.TemplateCache.get(hotDealTemplate),
        templateHelpers: function () {
            return {
                hotDealText: App.dictionary.get('tourRelated.FreeFormText.HotDeal'),
                hotDealSummary: function () {
                    return $("#hotDealSummary").val();
                }
            };
        }
    });
    // Our module now returns our view
	return HotDealItemView;
});