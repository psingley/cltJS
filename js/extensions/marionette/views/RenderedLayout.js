define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app'
], function ($, _, Backbone, Marionette, App) {
    var RenderedLayout = Backbone.Marionette.Layout.extend({
        render: function () {
            if (this.onRender) {
                this.onRender();
            }
            return this;
        },
        constructor: function (options) {
            options = options || {};

            this._ensureElement();
            this.bindUIElements();
            Marionette.Layout.prototype.constructor.call(this, options);
        }
    });

    return RenderedLayout;
});