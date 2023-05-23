define([
    'app',
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'extensions/marionette/views/RenderedLayout'
], function (App, $, _, Backbone, Marionette, RenderedLayout) {
    var ExtensionNotesLayout = RenderedLayout.extend({

        initialize: function() {

            var ul = $('#document_notes_modal').find('ul');
            //var li = ul[0].children;
            var j = 0;
            //for (var i = 0; i < li.length; i++) {
                
                //li[i].addEventListener("click", function (event,i) {
                    //event.preventDefault();
                //    var target = li[i].href;
                //    $('#document_notes_modal')
                //        .animate({
                //            scrollTop: $(target).offset().top
                //}, 1000);
                //    j++;
               // });

                //li[i].OnClick = function(e) {
                //     e.preventDefault();
                //};
            }
            
        //}
        //myFunction: function (e) {
        //    e.preventDefault();
        //}
    });

    return ExtensionNotesLayout;
});