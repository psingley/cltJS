
define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'event.aggregator',
		'views/tourDetailPage/notes/NotesView',
		'collections/tourDetailPage/notes/NotesCollection'
	],
	function ($, _, Backbone, Marionette, App, EventAggregator, NotesView, NotesCollection) {
		var NotesListView = Backbone.Marionette.CollectionView.extend({
			collection: NotesCollection,
			itemView: NotesView,
			onShow: function () {
				$('#notesTitle').show();
				$('#tourNotes').show();

				var $el = $(this.$el);
				$el.children().unwrap();
			}
		});
		// Our module now returns our view
		return NotesListView;
	});

