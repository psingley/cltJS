define([
        'app',
        'jquery',
        'backbone',
        'marionette',
        'event.aggregator'
    ],
    function (App, $, Backbone, Marionette, EventAggregator) {
        /**
         * @class BrochureController
         */
        return Backbone.Marionette.Controller.extend({
            initialize: function () {
                this.brochureDomain = App.dictionary.get('brochures.BrochureDomain');

                this.$brochureLoader = $('#brochure-loader');
                this.$brochureCloseBtn = $('#brochure-close-button');
                this.$body = $('body');
            },
            showBrochure: function (currentBrochure) {
                var href = this.brochureDomain + currentBrochure + "?e=0/0";
                this.$brochureLoader.attr("src", href).addClass("show");
                this.$brochureCloseBtn.addClass("show");
                this.$body.addClass("no-scroll");
            },
            hideBrochure: function () {
                this.removeIframe();
                $('html,body').animate({scrollTop: $('.brochure_list').offset().top}, 'slow');
            },
            removeIframe: function () {
                this.$brochureLoader.attr("src", "").removeClass("show");
                this.$brochureCloseBtn.removeClass("show");
                this.$body.removeClass("no-scroll");
            }
        });
    });