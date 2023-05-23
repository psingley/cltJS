define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'extensions/marionette/views/RenderedLayout',
    'util/seoTaggingUtil',
    'goalsUtil'
], function ($, _, Backbone, Marionette, App, RenderedLayout, SeoTaggingUtil, goalsUtil) {
    /**
     * @class brochureListingsLayout
     * @extends RenderedLayout
     *
     */

    var brochureListingsLayout = RenderedLayout.extend({
        el: '.brochure_list',
        initialize: function () {
            if (App.isAAASite) {
                var brochureDomain = App.dictionary.get('brochures.BrochureDomain');
                this.ui.$brochureBtns.each(function () {
                    var btn = $(this);
                    btn.attr("target", "_self");
                    btn.attr("href", function () {
                        var href = btn.attr("href");
                        var newHref = href.replace(brochureDomain, "#brochure/");
                        return newHref;
                    });
                });
            }
        },
        ui: {
            '$brochureBtns': '.brochure-button'
        }
    });
    return brochureListingsLayout;
});