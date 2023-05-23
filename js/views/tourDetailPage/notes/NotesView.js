define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'models/tourDetailPage/notes/NotesModel',
		'text!templates/tourDetailPage/notes/notesTemplate.html'
	],
	function ($, _, Backbone, Marionette, TravelTipModel, notesTemplate) {
		var NotesView = Backbone.Marionette.ItemView.extend({
			model: TravelTipModel,
			template: Backbone.Marionette.TemplateCache.get(notesTemplate),
			intialize: function() {
			},
			templateHelpers: function() {

				return{
					note: this.model.get('note'),
					noteType: this.model.get('noteType')
				};
			},
			onShow: function() {
				var $el = $(this.$el);
				$el.children().unwrap();
			}

		});
// Our module now returns our view
		return NotesView;
	});
