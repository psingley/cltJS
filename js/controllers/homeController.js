define([
    'app',
    'jquery',
    'backbone',
    'marionette',
    'event.aggregator',
    'domReady',
    'renderedLayouts/home/HomePageFiltersLayout'
],
    function (App, $, Backbone, Marionette, EventAggregator, domReady, HomePageFiltersLayout) {
        return Backbone.Marionette.Controller.extend({
            initialize: function () {
                this.onPageLoad();
            },
            onPageLoad: function () {
                domReady(function () {
                    //instantiate views/renderedLayouts for server side rendered components
                    var homePageFiltersLayout = new HomePageFiltersLayout();
                });
            }
        });
    });