define([
    'jquery',
    'underscore',
    'backbone'],
    function ($, _, Backbone) {
        var partnerPageUtil = {

            swapDivs: function () {
                var d1 = $('#brandedOfferD1').html();
                var d2 = $('#brandedOfferD2').html();

                if ($(window).width() <= 1024) {
                    var d2o = d2;
                    if ($('#brandedOfferD1 div.branded-offer').length == 0) {
                        $('#brandedOfferD2').html(d1);
                        $('#brandedOfferD1').html(d2o);
                    }
                }
                else {
                    if ($('#brandedOfferD2 div.branded-offer').length == 0) {
                        var d1o = d1;
                        $('#brandedOfferD1').html(d2);
                        $('#brandedOfferD2').html(d1o);
                    }
                }
            },

            partnerResize: function () {
                var swaptimeout;
                window.onresize = function () {
                    clearTimeout(swaptimeout);
                    swaptimeout = setTimeout(partnerPageUtil.swapDivs, 250);
                };
            },

            partnerUpdateCss: function () {
                $('.header-menu .button-container').css('display', 'none');
                $('.footer-newsletter').css('display', 'none');
                $('.phd').height = $('.partner-brochure').height;
                $('.phd').css('padding-right', '0');
                $('.pad-v').css('display', 'none');
                $("li:contains('Email Sign-up')").css('display', 'none');
                $("li:contains('Email sign-up')").css('display', 'none');
            }
        }
       
        return partnerPageUtil;
    });