define([
        'app',
        'renderedLayouts/modals/SurveyModalLayout'
    ],
    function (App, SurveyModalLayout) {
        App.module("SurveyModal", function () {
            this.startWithParent = false;
            this.addInitializer(function () {
                //wrap a block of text in the domReady object so
                //that is gets called after the dom has loaded.
                var surveyModalLayout = new SurveyModalLayout();
            });
        });
    });