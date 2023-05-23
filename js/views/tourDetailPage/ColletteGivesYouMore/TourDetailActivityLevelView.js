define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'models/tourDetailPage/ColletteGivesYouMore/TourDetailActivityLevelModel',
    'text!templates/tourDetailPage/ColletteGivesYouMore/tourDetailActivityLevelTemplate.html',
    'event.aggregator',
], function ($, _, Backbone, Marionette, App, TourDetailActivityLevelModel, tourDetailActivityLevelTemplate, event) {
    var tourDetailActivityLevelView = Backbone.Marionette.ItemView.extend({
        model: TourDetailActivityLevelModel,
        template: Backbone.Marionette.TemplateCache.get(tourDetailActivityLevelTemplate),
        templateHelpers: function () {
            return {
                ActivityLevelNumber: this.model.get("activityLevelNumber"),
                Summary: this.model.get("summary"),
                ActivityLevel: App.dictionary.get('tourRelated.FreeFormText.ColletteGivesYouMore.ActivityLevel'),
                Description: this.model.get("description")            }
        },
        onShow: function () {
            $.fn.activityLevelModal = function () {

                // activity level is set in the activity level icon
                // located in the TOUR DETAILS HIGHLIGHTS component
                var activityLevel = parseInt($('#activity-level-icon').attr('data-activity-level')) - 1;

                var $modal = this;
                var $selectorsWrap = $modal.find('.bullet-selectors');
                var $selector = $selectorsWrap.find('div');
                var $content = $modal.find('.bullet-content');
                var currentIndex;

                $selector.eq(activityLevel).addClass('is-tour');

                setBullet(activityLevel);

                $selectorsWrap.on('click',
                    'div',
                    function () {
                        setBullet($(this).index());
                    });

                function setBullet(index) {
                    if (index === currentIndex) {
                        return;
                    }
                    $selectorsWrap.find('.is-active').removeClass('is-active');
                    $content.find('.is-active').removeClass('is-active');
                    $selector.eq(index).addClass('is-active');
                    $content.children().eq(index).addClass('is-active');
                    currentIndex = index;
                }

                
                
            };
            $('.activity-level-modal').activityLevelModal();
        }
    });
    return tourDetailActivityLevelView;
});
