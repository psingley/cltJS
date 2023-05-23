define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/timeoutUtil'
], function ($, _, Backbone, Marionette, App, TimeoutUtil) {
    var formUtil = (function () {

        var constructor = function () {
            var timeoutKeyValuePairs = {};
            this.saveInput = function (e, model) {
                var $target = $(e.target);
                var name = $target.attr('name');

                if (name != 'ignore') {
                    //if we already have an object with a time out util set up for a field use that one
                    if (timeoutKeyValuePairs[name]) {
                        timeoutKeyValuePairs[name].timeoutUtil
                            .suspendOperation(300, function () {
                                var value = $target.val();
                                model.set(name, value);
                                console.log('traveler info saved');
                            });
                    } else {
                        //create the object and add a new timeout util to manage this specific field
                        timeoutKeyValuePairs[name] = {};
                        timeoutKeyValuePairs[name].timeoutUtil = new TimeoutUtil();
                        timeoutKeyValuePairs[name].timeoutUtil
                            .suspendOperation(300, function () {
                                var value = $target.val();
                                model.set(name, value);
                                console.log('traveler info saved');
                            });
                    }
                }
            }
        }

        return constructor;
    })();

    return formUtil;
});