define([
		'jquery',
		'underscore',
		'backbone',
		'marionette',
		'app',
		'collections/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreImageCollection',
		'views/tourDetailPage/ColletteGivesYouMore/ColletteGivesYouMoreImageView'
],
	function ($, _, Backbone, Marionette, App, ColletteGivesYouMoreImageCollection, ColletteGivesYouMoreImageView) {
	    var ColletteGivesYouMoreListView = Backbone.Marionette.CollectionView.extend({
	        collection: ColletteGivesYouMoreImageCollection,
	        itemView: ColletteGivesYouMoreImageView,
	        initialize: function () { },
	        onShow: function () {

	            //to remove extra divs added by backbone while rendering view
	            var divTags = $(".col-sm-6.cgym");
	            if (divTags.parent().is("div"))
	                divTags.unwrap();
	            if (divTags.parent().is("div"))
	                divTags.unwrap();
	        }
	    });

		return ColletteGivesYouMoreListView;
	});