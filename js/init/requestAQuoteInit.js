define([
        "app",
        'jquery',
        'underscore',
        'marionette',
        'backbone',
    'renderedLayouts/customerLead/RequestAQuoteModalLayout',
    'util/criteoTrackingUtils'
],
    function (App, $, _, Marionette, Backbone, RequestAQuoteModalLayout, CriteoTrackingUtils) {


        if (App.siteSettings.isRequestAQuoteEnabled == true) {

            // Request A Quote
            $(".request_quote_button").on("click", function(e) {
                e.preventDefault();
                var requestAQuoteModule = App.module("requestAQuoteModule");

                if (App.requestAQuoteModalLayout == null) {
                    requestAQuoteModule.start();
                }
                requestAQuoteModule.displayModal($(this));
            });

            $(".request-a-quote").on("click", function (e) {
                e.preventDefault();
                var requestAQuoteModule = App.module("requestAQuoteModule");

                if (App.requestAQuoteModalLayout == null) {
                    requestAQuoteModule.start();
                }
                requestAQuoteModule.displayModal($(this));
            });

        	// Request A Quote
            $("div[data-searchPanel]").on("click", "button.request_quote_button", function (e) {
            	e.preventDefault();
            	var requestAQuoteModule = App.module("requestAQuoteModule");

            	if (App.requestAQuoteModalLayout == null) {
            		requestAQuoteModule.start();
            	}
            	requestAQuoteModule.displayModal($(this));
            });

            $("div[data-searchPanel]").on("click", "button.request-a-quote", function (e) {
                e.preventDefault();
                var requestAQuoteModule = App.module("requestAQuoteModule");

                if (App.requestAQuoteModalLayout == null) {
                    requestAQuoteModule.start();
                }
                requestAQuoteModule.displayModal($(this));
            });
        }

        App.module("requestAQuoteModule", function (requestAQuoteModule) {

            this.startWithParent = false;

            this.addInitializer(function() {
                if (App.requestAQuoteModalLayout == null) {
                    App.requestAQuoteModalLayout = new RequestAQuoteModalLayout();
                }
            });

            this.addFinalizer(function () { });

            requestAQuoteModule.displayModal = function(clickedButton)
            {
                if (clickedButton == null) {
                    return;
                }

                if (App.siteSettings.templateId == "{6308F77F-B718-42EF-B7B7-79B4A1AC9144}") {
                    if (App.siteSettings.siteLanguage == "en" || App.siteSettings.siteLanguage == "en-CA") {
                        CriteoTrackingUtils.trackPreConversion(App.siteSettings.criteoPixelId);
                    }
                }

                //get tour info
                var tourId = clickedButton.data('tourid'),
                    tourImage = clickedButton.data('tourimage'),
                    tourSummary = clickedButton.data('toursummary'),
                    tourTitle = clickedButton.data('tourtitle');
                    tourDate = clickedButton.data('nextdate');

                if (App.requestAQuoteModalLayout == null) {

                    App.requestAQuoteModalLayout = new RequestAQuoteModalLayout({
                        'tourId': tourId,
                        'tourImage': tourImage,
                        'tourTitle': tourTitle,
                        'tourSummary': tourSummary,
                        'tourDate': tourDate
                    });

                } else {

                    App.requestAQuoteModalLayout.initialize({
                        'tourId': tourId,
                        'tourImage': tourImage,
                        'tourTitle': tourTitle,
                        'tourSummary': tourSummary,
                        'tourDate': tourDate
                    });
                }

                $('#request-quote-modal').modal('show');
            }
        });
   
    });