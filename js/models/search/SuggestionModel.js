// Filename: models/project
define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var SuggestionModel = Backbone.Model.extend({
        defaults: {
            displayName: '',
            imageUrl: '',
            url: '',
						type:''
        }
    });
    // Return the model for the module
    return SuggestionModel;
});