define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'collections/tourDetailPage/prePost/PrePostCollection',
		'views/tourDetailPage/prePost/PrePostItemView'
	],
	function($,
		_,
		Backbone,
		Marionette,
		App,
		PrePostCollection,
		PrePostItemView) {
		var PrePostListView = Backbone.Marionette.CollectionView.extend({
			collection: PrePostCollection,
			itemView: PrePostItemView,
			initialize: function() {},
			onShow: function() {

				//to remove extra divs added by backbone while rendering view
				this.$el = this.$el.children();
				this.$el.unwrap();

				var divTags = $(".pre-post");
				if (divTags.parent().is("div"))
					divTags.unwrap();

				$('#tour-pre-post-nights-section-container').show();

			}
		});

		return PrePostListView;
	});