define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'models/tour/PackageExperiencesModel',
    'text!templates/tour/packageExperiencesTemplate.html',
    'event.aggregator',
    'util/objectUtil',
    'app'
], function ($, _, Backbone, Marionette, PackageExperiencesModel, packageExperiencesTemplate, EventAggregator, ObjectUtil, App) {
    var PackageExperiencesView = Backbone.Marionette.ItemView.extend({
        model: PackageExperiencesModel,
        template: Backbone.Marionette.TemplateCache.get(packageExperiencesTemplate),
        templateHelpers: function() {
            var viewContext = this;
            return {
                showMustSee: !ObjectUtil.isNullOrEmpty(viewContext.model.get('mustSee')),
                showChoiceOnTour: !ObjectUtil.isNullOrEmpty(viewContext.model.get('choiceOnTour')),
                showCulinary: !ObjectUtil.isNullOrEmpty(viewContext.model.get('culinary'))
            };
        },
        onShow: function () {
            var yourRouteTitle = this.model.get("yourRouteTitle"),
                yourRouteSummary = this.model.get("yourRouteSummary"),
                yourRouteDescription = this.model.get("yourRouteDescription"),
                mapImage = this.model.get("mapImage");

            //show section only if all data points are set
            if ( ObjectUtil.isNullOrEmpty(yourRouteSummary) || ObjectUtil.isNullOrEmpty(mapImage.url)) {
                $('#route_section_container').hide();
                $('#route_section_container').attr('shownondesktop', 'false');
            } else {
                $('#route_section_container').show();
                $('#route_section_container').attr('shownondesktop', 'true');
                $('#yourRouteTitle').html(yourRouteTitle);
            }

            var showRouteDetails =  !ObjectUtil.isNullOrEmpty(yourRouteDescription);
            
        	// expand the personalize your tour section when pdf download button clicked
	        if (window.location.href.indexOf("p=1") > -1) {
		        $('#extensionExpandedView').show();
	        }

            //show view more if we have 
            if (showRouteDetails == false) {
                $('#viewRouteDetails').hide();
                $('#extensionsHeaderSections').hide();
            } else{
               if(!App.mobile){
                   $('#extensionsHeaderSections').show();
                   //$('#viewRouteDetails').show();
               }
            }
        }
    });
    // Our module now returns our view
    return PackageExperiencesView;
});
