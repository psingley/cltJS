define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'models/tour/ActivityLevelModel',
    'text!templates/tour/activityLevelTemplate.html',
    'event.aggregator',
    'util/objectUtil',
    'app'
], function ($, _, Backbone, Marionette, ActivityLevelModel, activityLevelTemplate, EventAggregator, ObjectUtil, App) {
    var ActivityLevelView = Backbone.Marionette.ItemView.extend({
        model: ActivityLevelModel,
        template: Backbone.Marionette.TemplateCache.get(activityLevelTemplate),
        //select the active activity level
        onShowCalled: function(){
            var activityLevelNumber = this.model.get("activityLevelNumber"),
                description = this.model.get("description"),
                travelTipsSummary = this.model.get("travelTipsSummary"),
                onImageUrl = this.model.get("onImageUrl"),
                activityLevelSummary = this.model.get("summary");
            //hides section if not all data points are set
            if (ObjectUtil.isNullOrEmpty(activityLevelNumber) || ObjectUtil.isNullOrEmpty(onImageUrl)) {
                $('#things_to_know_section .col_container .left_col').hide();
               
            } else{

                $('#things_to_know_section_container').show();
                $('#things_to_know_section_container').attr('shownondesktop', 'true');
                //first reset all activity levels to off
                $('.numbers_container img').each(function()
                {   var offImageUrl=$(this).attr('data-offimageurl');
                    $(this).attr("src",offImageUrl) ;
                });
                //reset activity level images
                $("#activityLevelImage_"+activityLevelNumber).attr("src",onImageUrl);
                $('#things_to_know_section .col_container .left_col').show();
            }

            //activity level summary
            if ( ObjectUtil.isNullOrEmpty(activityLevelSummary)) {

                $('#activityLevelSummary').hide();

            } else{
                $('#activityLevelSummary').html(activityLevelSummary);
                $('#activityLevelSummary').show();
            }

            //travel tips summary
            if ( ObjectUtil.isNullOrEmpty(travelTipsSummary)) {

                $('#travelTipsTopSection').hide();

            } else{
                $('#travelTipsSummary').html(travelTipsSummary);
                $('#travelTipsTopSection').show();
            }


        }
    });
// Our module now returns our view
    return ActivityLevelView;
});
