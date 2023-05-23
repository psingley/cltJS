define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'domReady',
    'renderedLayouts/brochures/BrochureOrderFormLayout',
    'controllers/brochureController',
    'routers/brochureRouter',
    'renderedLayouts/brochures/BrochureListingsLayout',
    'util/objectUtil',
    'renderedLayouts/brochures/UKBrochureOrderFormLayout',
    'renderedLayouts/brochures/CABrochureOrderFormLayout',
	'cookie'
], function ($, _, Backbone, Marionette, App, domReady, BrochureOrderFormLayout, BrochureController, BrochureRouter, BrochureListingsLayout, ObjectUtil, UKBrochureOrderFormLayout, CABrochureOrderFormLayout, cookie) {
    /**
     * @module Brochures
     * @inherits Marionette.Module
     */
    App.module("Brochures", function (Brochures) {
        this.startWithParent = true;
        var moduleContext = this;

        /**
         * Brochure cookie
         *
         * @property newsletterCookie
         */
        var brochuresCookie = cookie.get('BrochureSignup');

        /**
         * The brochure cookie parsed into a javascript object
         *
         * @property newsletterCookie
         */
        this.brochuresCookie = brochuresCookie && brochuresCookie != 'undefined' ? JSON.parse(brochuresCookie) : undefined;

        /**
         * Sets the cookies for newsletter
         *
         * @method setCookies
         */
        var setCookies = function () {
            if (!ObjectUtil.isNullOrEmpty(Brochures.cookieValue)) {
                return;
            }

            var expDate = new Date();
            expDate.setDate(expDate.getDate() + 15);

            cookie.set("BrochureSignup", JSON.stringify(Brochures.cookieValue), { path: '/', expires: expDate });
        };

        this.addInitializer(function () {
            Brochures.brochureListingsLayout = new BrochureListingsLayout();

            var ukLanguageArray = ['en-GB', 'en-NZ'];
            if (App.siteIds.Collette === App.siteSettings.siteId && ukLanguageArray.indexOf(App.siteSettings.siteLanguage) > -1) {
                Brochures.brochuresFormLayout = new UKBrochureOrderFormLayout();
            } else if (App.siteIds.Collette === App.siteSettings.siteId && App.siteSettings.siteLanguage === 'en-CA') {
                Brochures.brochuresFormLayout = new CABrochureOrderFormLayout();
            } else {
	           
                Brochures.brochuresFormLayout = new BrochureOrderFormLayout();
            }

            //set up the controller for this page
            $.when(App.dictionary.getDictionaries())
                .done(function () {
                    moduleContext.appRouter = new BrochureRouter({
                        controller: new BrochureController()
                    });
                });

            App.start();
        });

        this.addFinalizer(function () {
            setCookies();
        });
    });
});