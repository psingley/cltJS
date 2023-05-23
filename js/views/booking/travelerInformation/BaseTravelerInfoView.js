define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'app',
    'util/travelerUtil'
], function ($, _, Backbone, Marionette, App, TravelerUtil) {
    /**
     * @class BaseTravelerInfoView
     * @extends Backbone.Marionette.Layout
     */
    var BaseTravelerInfoView = Backbone.Marionette.Layout.extend({
        /**
         * Saves the traveler info after each keyup..
         * will ignore fields with a name equal to ignore
         *
         * @method saveTravelerInfo
         * @param e
         */
        saveTravelerInfo: function (e) {
            var $target = $(e.target);
            var name = $target.attr('name');

            if (name === 'ignore') {
                return;
            }

            //code to save email into model if pre-filled
            try {
                if (name === 'phone' || name === 'city' || name === 'Address1' || name === 'Address2' || name === 'mobile' || name === 'confirmEmail') {
                    dt = e.currentTarget.parentElement.parentElement.parentElement.querySelector('input.email').value;
                    this.model.set('email', dt);
                }
            } catch (error) { console.error(error); }

            if ($target.is('input:text')) {
                this.saveTextInput($target, name);

            }

            if ($target.is('select')) {
                if (name === "iataCode") {
                    this.model.set('iataCode', Number($target.val()));
                    console.log(this.model);
                } else {
                    this.saveDropDownValue($target, name);
                }
            }

            if ($target.is('input:checkbox')) {
                this.saveCheckboxInput($target, name);
            }

            App.Booking.Steps['travelerStep'].updateSubmissionStatus();

           
        },
        saveDropDownValue: function ($target, name) {
            var $taxonomy = $target.find('option:selected');
            var taxonomyId = $taxonomy.data('id');
            var taxonomy = App.taxonomy.getTaxonomyItemById(taxonomyId);

            this.model.set(name, taxonomy);
        },
        saveTextInput: function ($target, name) {
            var value = $target.val();
            this.model.set(name, value);
            console.log('traveler info saved');
        },
        saveCheckboxInput: function ($target, name) {
            var value = $target.is(':checked');
            this.model.set(name, value);
            console.log('traveler info saved');
        }
    });

    return BaseTravelerInfoView;
});