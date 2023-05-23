define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app'
], function ($, _, Backbone, Marionette, App) {
    var inheritUtil = {
        inherit: function (cls, superCls) {
            // We use an intermediary empty constructor to create an
            // inheritance chain, because using the super class' constructor
            // might have side effects.
            var construct = function () {
            };
            construct.prototype = superCls.prototype;
            cls.prototype = new construct;
            cls.prototype.constructor = cls;
            cls.super = superCls;
        }
    };

    return inheritUtil;
});