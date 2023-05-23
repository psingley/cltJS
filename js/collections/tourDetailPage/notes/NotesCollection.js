// Filename: models/project
define([
    'underscore',
    'backbone',
    'models/tourDetailPage/notes/NotesModel'
], function(_, Backbone, NotesModel){
    var NotesCollection = Backbone.Collection.extend({
        defaults: {
            model: NotesModel
        }
    });
    // Return the model for the module
    return NotesCollection;
});