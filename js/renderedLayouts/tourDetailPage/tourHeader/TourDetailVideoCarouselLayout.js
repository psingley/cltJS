define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'extensions/marionette/views/RenderedLayout'
],
function ($, _, Backbone, Marionette, RenderedLayout) {
    var tourDetailHero = RenderedLayout.extend({
        el: ".tour-detail-hero",
            initialize: function() {
                window._wq = window._wq || [];
                _wq.push({
                    id: "_all", onReady: function (video) {
                    },
                    options: {
                        videoFoam: {
                            minWidth: 1000,
                            maxWidth: 1000,
                            minHeight: 500,
                            maxHeight:500
                        }
                    },
                    onReady: function (video) {
                        video.bind("play", function () {
                            slider.pause();
                            console.log('slider paused');
                            slider.events.on('indexChanged', function () {
                                video.pause();
                            });
                            return video.unbind;
                        });
                        video.bind("pause", function () {
                            slider.play();
                            console.log('slider play');
                            return video.unbind;
                        });
                    }
                });
            },

        });
        return tourDetailHero;
});