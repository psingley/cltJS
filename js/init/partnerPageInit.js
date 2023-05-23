define([
	"app",
	'jquery',
	'underscore',
	'marionette',
	'backbone',
	'domReady',
	'util/partnerPageUtil'
],
    function (App, $, _, Marionette, Backbone, domReady, partnerPageUtil) {
        App.module("PartnerPage", function () {
            this.startWithParent = false;

            this.addInitializer(function () {
                domReady(function () {
                    App.start();
                    partnerPageUtil.partnerResize();
                    partnerPageUtil.partnerUpdateCss();
                });
            });
        });
    });
