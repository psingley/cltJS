// Filename: models/project
define([
    'underscore',
    'backbone',
    'util/dateUtil'
], function(_, Backbone, DateUtil ){
    /**
     * @cla
     */
    var ResultModel = Backbone.Model.extend({
        defaults: {
            id: '',
            title: "title",
            summary: "summary",
            numberOfDaysMin: 0,
            numberOfDaysMax: 0,
            numberOfMealsMin: 0,
            numberOfMealsMax: 0,
            minPrice: 0,
            tourDetailUrl: '',
            imageUrl:'',
            imageUrlAlt:'',
            smallImageUrl:'',
            smallImageUrlAlt:'',
            badgeImageUrl: "www.badgeimageurl.com",
            feefoStars: 0.0,
            hideBookNow: false,
            secondarySummary: '',
            //highlights:''
        } ,
        initialize: function (result) {
            //console.log(result);
            var imageObj = JSON.parse(result.image);
            var smallImageObj = JSON.parse(result.smallImage);
            if(imageObj){
                this.set({imageUrl:imageObj.url,imageUrlAlt:imageObj.altTag });
            }

            if(smallImageObj){
                this.set({smallImageUrl:smallImageObj.url,smallImageUrlAlt:smallImageObj.altTag });
            }

            if (result.offers != null && result.offers.length > 0) {
                var offersObj = result.offers.map(function (item) {
                    return $.parseJSON(item);
                });
                this.set({offers: offersObj});
            }
			/*if (result.minPriceDate != null) {
				var dateObj = JSON.parse(result.minPriceDate);
				this.set({ minPriceDate: dateObj });
			}*/
        }
    });
    // Return the model for the module
    return ResultModel;
});