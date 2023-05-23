(function ( $ ) {

	function buildModal(id) {
		return '<div id="' + id + '" class="gallery-carousel-modal modal fade"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title"></h4></div><div class="modal-body"></div><div class="modal-footer"></div></div></div></div>';
	}

	function getImages(parentEl, imgSelector) {
		return parentEl.find(imgSelector);
	}

	function buildCarousel(els, id, attr) {
		var html = '<div id="' + id + '" class="gallery-carousel carousel slide" data-ride="carousel" data-interval="false"><div class="carousel-inner" role="listbox">';

		var count = 0;
		els.each(function() {
			var img = $(this);

			html += '<div class="item';

			if(count === 0) {
				html += ' active';
				count++;
			}

			html += '" data-title="' + img.attr("alt") + '" data-description="' + img.attr("data-description") + '"><img src="' + img.attr(attr) + '" alt="' + img.attr("alt") + '"></div>';
		});

		html += '</div><a class="left carousel-control" href="#' + id + '" role="button" data-slide="prev"><span class="fa fa-chevron-left" aria-hidden="true"></span><span class="sr-only">Previous</span></a><a class="right carousel-control" href="#' + id + '" role="button" data-slide="next"><span class="fa fa-chevron-right" aria-hidden="true"></span><span class="sr-only">Next</span></a></div>';

		return html;
	}

	function updateSlideInfo(slide, titleEl, descriptionEl) {
		titleEl.html(slide.attr("data-title"));
		descriptionEl.html("<div class='modal-footer-content'>" + slide.attr("data-description") + "</div>");
	}

	$.fn.galleryCarousel = function( options ) {
 
		// Default Options
		var settings = $.extend({
			itemClass: "gallery-item",
			imgSelector: "img",
			imgSrcAttr: "src",
			/*animateHeight: true,*/
			animationSpeed: 500
		}, options );

		// Loop over all matched elements
		return this.each(function() {
			var el = $(this); // Store the current element

			var modalID = el.attr("id") + "-modal"; // Dynamically create modal ID
			el.after(buildModal(modalID)); // Add modal HTML after the gallery element

			//Store the modal element and .modal-body element to insert the carousel into
			var galleryModal = $("#" + modalID),
				galleryModalBody = galleryModal.find(".modal-body"),
				galleryModalTitle = galleryModal.find(".modal-title"),
				galleryModalFooter = galleryModal.find(".modal-footer");

			// Setup Carousel
			var clickTrack = 0, // Used to track the first gallery item click
				galleryItems = el.find("." + settings.itemClass), // Gallery items to use in the carousel
				images = getImages(el, settings.imgSelector), // Store images from the gallery items
				carouselID = el.attr("id") + "-carousel", // Dynamically create carousel ID
				carousel = $("#" + carouselID), // Store the initial instance of the carousel. Not sure why this is needed, but plugin breaks without it.
				slide; 

			galleryItems.click(function() {
				if(clickTrack === 0) { // Track first click and add carousel to .modal-body
					galleryModalBody.html(buildCarousel(images, carouselID, settings.imgSrcAttr));
					carousel = $("#" + carouselID); // Store new instance of the carousel
					clickTrack++; // Increment to avoid adding multiple carousels
				}
				galleryModal.modal("toggle"); // Show the modal when a gallery item is clicked
				carousel.find(".active").removeClass("active");
				carousel.find(".item").eq($(this).index()).addClass("active");

				slide = carousel.find(".active");
				slide.parent().css({ height: "auto" }); // fixes bug where .carousel-inner has height of 0
				updateSlideInfo(slide, galleryModalTitle, galleryModalFooter);
			});

			$(document).on('slid.bs.carousel', carousel, function (e) {
				updateSlideInfo(carousel.find(".active"), galleryModalTitle, galleryModalFooter);
			});

			/*if(settings.animateHeight) {
				$(document).on('slide.bs.carousel', carousel, function (e) {
					var nextH = $(e.relatedTarget).height();
					$(this).find('.active.item').parent().animate({ height: nextH }, settings.animationSpeed);
				});
			}*/
		});
 
	};
 
}( jQuery ));