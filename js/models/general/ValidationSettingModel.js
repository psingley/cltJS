define([
    'jquery',
    'underscore',
    'backbone',
    'collections/general/ValidationInputsCollection',
    'models/general/ValidationInputModel'
], function($,_, Backbone, ValidationInputsCollection, ValidationInputModel){
    var ValidationSettingModel = Backbone.Model.extend({
        defaults: {
            inputs: new ValidationInputsCollection(),
            functionName: '',

            // only 1 model of this type can be used in collection
            asyncInput: null
        },
        initialize: function (params) {
            if (params.inputs !== undefined) {
                var arrayOfInputs = _.map(params.inputs, function (item) {
                    return item.el === undefined ? new ValidationInputModel({el: item}) : new ValidationInputModel(item);
                });
                this.set("inputs", new ValidationInputsCollection(arrayOfInputs));
            }
        }
    });
    // Return the model for the module
    return ValidationSettingModel;
});
