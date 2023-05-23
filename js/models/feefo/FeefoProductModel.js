define([
    'jquery',
    'underscore',
    'backbone',
    'models/feefo/FeefoMediaModel',
    'collections/feefo/FeefoMediaCollection'
], function ($, _, Backbone, FeefoMediaModel, FeefoMediaCollection) {
    var FeefoProductModel = Backbone.Model.extend({
        defaults: {
            id: '',
            rating: '',
            review: '',
            media: '',
            productTitle: '',
            productId: '',
            productUrl: '',
            reviews_url: '',
            merchant_comment: '',
            merchant_author: '',
            created_at: ''
        },
        initialize: function() {
            this.set('rating', this.get('rating').rating);

            var product = this.get('product');
            this.set('productTitle', product.title);
            this.set('productId', product.sku);
            this.set('productUrl', product.url);
            this.set('reviews_url', product.reviews_url);

            var mediaCollection = this.get('media');
            this.media = new FeefoMediaCollection(
                _(mediaCollection).map(function(media){
                    return new FeefoMediaModel(media);
                })
            );

            var thread = this.get('thread');
            if(thread && thread[0] && thread[0].type === 'MERCHANT_COMMENT') {
                this.set('merchant_comment',thread[0].comment);
                this.set('merchant_author', thread[0].author);
            }
        }
    });
    // Return the model for the module
    return FeefoProductModel;
});