define([
    'jquery',
	'app',
    'underscore',
    'backbone',
    'marionette',
    'event.aggregator',
    'models/tour/PackageDescriptionModel',
    'text!templates/tour/packageDescriptionTemplate.html',
    'jquery.cycle',
    'util/objectUtil'
], function ($, App, _, Backbone, Marionette, EventAggregator, PackageDescriptionModel, packageDescriptionTemplate, JqueryCycle,ObjectUtil) {
    var PackageDescriptionView = Backbone.Marionette.ItemView.extend({
        model: PackageDescriptionModel,
        template: Backbone.Marionette.TemplateCache.get(packageDescriptionTemplate),
		templateHelpers: function() {
			var viewContext = this;

			return {
				experienceUrl: viewContext.model.get('links').experienceUrl,
				experienceThisTourText: App.dictionary.get('tourRelated.Buttons.ExperienceThisTour'),
				sTitle: viewContext.model.get('content').sliderSectionTitle,
                desc: viewContext.model.get('content').description,
                sliderImages: function() {
                    return viewContext.model.get('media').sliderImagesAndVideos;
                }
		    };
		},
        onShow: function () {
            var showExperienceButton = this.model.showExperienceButton;

            if (!showExperienceButton) {
                $('#showExperienceButtonHref').hide();
            }

            var videos = _.filter(this.model.get('media').sliderImagesAndVideos, function (element) {
                return !ObjectUtil.isNullOrEmpty(element.videoId);
            });

            if (!ObjectUtil.isNullOrEmpty(videos) && videos.length > 0) {
                $('<script src="https://fast.wistia.com/assets/external/E-v1.js" async> </script>').insertBefore('#tour-detail-carousel');
            }

            _.each(videos, function (video) {
                $('<script src="https://fast.wistia.com/embed/medias/' + video.videoId + '.jsonp" async > </script>').insertBefore('#tour-detail-carousel');
            });

                        
            var tourCarousel = $('#tour-detail-carousel');
            var slidesNum = tourCarousel.children().length;
            
            if (slidesNum > 1) {
                               
                
                var somethingIsPlaying = false;

                // when all video objects are loaded
                EventAggregator.on('videosLoaded', function (sliderVideos) {

                    if (sliderVideos && sliderVideos.length > 0) {
                        // make sure that all videos are paused when user manually changes the slide
                        tourCarousel.bind('slide.bs.carousel', function (e) {
                            _.each(sliderVideos, function (video) {
                                        video.pause();
                                        somethingIsPlaying = false;
                                    });
                            
                        });
                        
                        // make sure that carousel loop is paused when we play video and is continued when it's paused
                        _.each(sliderVideos, function (video) {
                            video.bind("play", function () {
                                somethingIsPlaying = true;
                                tourCarousel.carousel('pause');
                            });

                            video.bind("pause", function () {
                                somethingIsPlaying = false;

                                // don't switch to next slide right away, wait 5 seconds
                                setTimeout(function () {
                                    if (!somethingIsPlaying) {
                                        tourCarousel.carousel('cycle');
                                    }
                                }, 5000);
                            });
                        });
                    }
                });

                // get list of all videos that are used in this carousel
                var videos = _.filter(this.model.get('media').sliderImagesAndVideos, function (sliderImage) {
                    return sliderImage.videoId != null;
                });

                // get list of ids of those videos
                var videoIds = _.map(videos, function (video) {
                    return video.videoId;
                });

                // load all required video objects from wistia
                window._wq = window._wq || [];
                _wq.push({
                    id: "_all", onReady: function () {
                        var allVideos = Wistia.api.all();

                        // make sure that we take only videos inside carousel
                        allVideos = _.filter(allVideos, function (video) {
                            if (!video || !video.data || !video.data.media || !video.data.media.hashedId) {
                                return false;
                            }
                            return _.contains(videoIds, video.data.media.hashedId);
                        });

                        // let other code know that we are ready to continue
                        EventAggregator.trigger('videosLoaded', allVideos);
                    }
                });
            }
        }
    });
    return PackageDescriptionView;
});
