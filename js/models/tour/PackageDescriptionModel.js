// Filename: models/facetItems
define([
    'jquery',
    'underscore',
    'backbone',
    'app',
    'collections/general/MediaImageCollection'
], function($,_, Backbone,App,MediaImageCollection){
    var PackageDescriptionModel = Backbone.Model.extend({
        defaults: {
        	experienceThisTourText: App.dictionary.get('tourRelated.Buttons.ExperienceThisTour'),
            packageSubTitle: '',
            packageDescription: '',
            experienceUrl: '',
            showExperienceButton:false,
            sliderImages: MediaImageCollection
        }
    });
    // Return the model for the module
    return PackageDescriptionModel;
});