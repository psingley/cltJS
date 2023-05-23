// Filename: collections/projects
define([
    'underscore',
    'backbone'
], function(_, Backbone){
    var SearchSettingsModel = Backbone.Model.extend({
        defaults: {
            searchDelayInMilliseconds: 500,
            defaultFacetShowMoreLength: 5,
            refineResultsText: 'Refine Results',
            resetButtonText: 'Reset',
            viewMoreText: 'View More Results'
        }
    });
    return SearchSettingsModel;
});
