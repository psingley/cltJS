define([
    'backbone',
    'marionette'
],function(Backbone, Marionette){
    /**
     * Use for pub/sub events across the application
     *
     * @class eventAggregator
     */
    return new Backbone.Wreqr.EventAggregator();
});