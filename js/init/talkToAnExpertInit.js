define([
        "app",
        'jquery',
        'underscore',
        'marionette',
        'backbone',
        'util/objectUtil',
        'renderedLayouts/customerLead/TalkToAnExpertModalLayout'
],
    function (App, $, _, Marionette, Backbone, ObjectUtil, TalkToAnExpertModalLayout) {

        if (App.siteSettings.isTalkToAnExpertEnabled == true) {

            // talk to an expert
            $(".talk_expert_button").on("click", function (e) {
                e.preventDefault();
                var talkToAnExpertModule = App.module("talkToAnExpertModule");

                if (App.talkToAnExpertModalLayout == null) {
                    talkToAnExpertModule.start();
                }

                talkToAnExpertModule.displayModal($(this));
            });
        }

        App.module("talkToAnExpertModule", function (talkToAnExpertModule) {

            this.startWithParent = false;

            this.addInitializer(function () {
                if (App.talkToAnExpertModalLayout == null) {
                    App.talkToAnExpertModalLayout = new TalkToAnExpertModalLayout();
                }
            });

            this.addFinalizer(function () { });

            talkToAnExpertModule.displayModal = function (clickedButton) {

            	var formType = clickedButton.data('formtype');
            	var floodlightCategory = clickedButton.data('floodlightcategory');
	            var floodlightType = clickedButton.data('floodlighttype');

                if (App.talkToAnExpertModalLayout == null) {
                    App.talkToAnExpertModalLayout = new TalkToAnExpertModalLayout();
                    App.talkToAnExpertModalLayout.initialize({ 'formType': formType, 'floodlightCategory': floodlightCategory, 'floodlightType': floodlightType});
                } else {
                	App.talkToAnExpertModalLayout.initialize({ 'formType': formType, 'floodlightCategory': floodlightCategory, 'floodlightType': floodlightType });
                }

                //update modal title
                var modalTitle = clickedButton.data('modaltitle');
                if (!ObjectUtil.isNullOrEmpty(modalTitle)) {
                    $('#talk-expert-modal #myModalLabel').html(modalTitle);
                }
                
                //update form title
                var formTitle = clickedButton.data('formtitle');
                if (!ObjectUtil.isNullOrEmpty(formTitle)) {
                    $('#talk-expert-modal #formTitle').html(formTitle);
                } 

                $('#talk-expert-modal').modal('show');
                $('#talk-expert-modal img').trigger('unveil');
            }
        });
    });