// JavaScript Document
(function($){
	$.fn.extend({ 
		ettCarousel:function(options) {  
		
			var defaults =  {};
			
			var options = $.extend(defaults, options);
			
			return this.each(function() {     
			 	var carousel = $(this);
			   
				var o = options; 
				/* // FROM DEFAULTS
 				var carouselItem = o.carouselItem,
					duration = o.duration,
					easing = o.easing,
					next = o.next,
					prev = o.prev;
				*/
				
				// create lightbox template
				var $body = $("body"),
					lightbox = $("<div>", {"class":"lightbox"}),
					closeTrigger = $("<div>", {"id" : "close_trigger"}),
					close = $("<div>", {"id" : "close", "html" : "&times;"}),
					duration = 250,
					$lightbox;
					
					// build the lightbox					
					function mapImages() {
						$(".photo").each(function(){
					        // get image urls on divs
					        imgUrl = 'url("' + $(this).data("image" ) + '")';
					        
					       // set data so we know where to animate to
					        $(this).attr( "data-left", $(this).offset().left);
					        $(this).attr( "data-top", $(this).offset().top);
					        $(this).attr( "data-height", $(this).height());
					        $(this).attr( "data-width", $(this).width());
					       
					        if($(this).data("video") != null) {
						       $(this).find("iframe")
						       			.attr("height", $(this).data("height")) 
						       			.attr("width", $(this).data("width")) 
					        }
					        
					        // set the image backgrounds
							$(this).css({
								backgroundImage : imgUrl
							});

						})
				        // hide all info bar rollovers
				        $(".info_bar").each(function(){
					        var h = $(this).outerHeight(),
					        	down = h * -1;
					        
					        $(this).css({
						        bottom:down
					        })
				        })
					}
					
					// activate photo rollovers
					$(".photo").hover(function(){
						var $thisBar = $(this).find($(".info_bar"))
							h = $thisBar.outerHeight();
						// animate the bar to show it
						$thisBar.stop().animate({bottom:0}, 250)
					}, function() {
						var $thisBar = $(this).find($(".info_bar"))
							down = $thisBar.outerHeight() * -1;
						// animate the bar to hide it
						$thisBar.stop().animate({bottom:down}, 250)
					})
					
				// this is a timeout that should remap the image 
				// position when a user resizes the window
				var tO;
				$(window).resize(function(){
					$("#close").click();
					clearTimeout(tO);
					tO = setTimeout(mapImages, 1000);
				})
				
				
				// MAKE THE MAGIC HAPPEN
					$(carousel).append(lightbox);
					$lightbox  = $(".lightbox");
					mapImages();
				
				
				$body.on("click", ".magnify", function(e){
		        	e.preventDefault();
					var $this =	$(this).parent();
								
					// hide clicked thumbnail			
					$this.addClass("hidden_content");
					
					// empty any straggler content
					$(".lightbox").empty();
					
					// get embedded content
					var lightboxContent = $this.find(".lightbox_content").parent().html();
					
					// is this a quote or no?
					if ($this.data("quote")) {
						$lightbox.append(lightboxContent).addClass("quote-bg");
						$(".lightbox .quote_box").css({"display" : "none"});
					} else {
						$lightbox.append(lightboxContent).removeClass("quote-bg");
					} 
					
					// Set up positioning for animation then animate
					$lightbox.css({
							"background-image" : "url(" + $this.data("image") + ")",
							"display" : "block",
							height: $this.height(),
							width: $this.width(),
							left: $this.offset().left,
							top: $this.offset().top - $(window).scrollTop()
						})
						.animate({
							left: $(window).width()/2 *.4,
							top: $(window).height()/2 *.2,
							width:"60%",
							height:"80%"
						}, duration, function(){
							carousel.append(closeTrigger);
							$lightbox.append(close);
									
							if ($this.data("quote")) {
								var parentHeight = $(".lightbox").height(),
									quoteHeight = $(".quote_box").height(),
									marginTop = (parentHeight - quoteHeight) / 1.7;
									
									if ($(window).width() < 480) {
										marginTop = (parentHeight - quoteHeight) / 2;
									}
									
								$(".quote_box").css({"top" :  marginTop + "px"}).fadeIn();
							} else if ($this.data("yt-video") != null)	{
								//build video for popup
								frame = $("<iframe>", {"class": "videoFrame", "height" : "100%", "width" : "100%", "frameborder" : "0", "src": $this.data("video")})
								// is this a bright cove video?
								
								$lightbox.append(frame);
								
							} else if ($this.data("video") != null)	{
								
								
				    	        object  = '<div id="BCLcontainingBlock">';
							    object += '<div class="BCLvideoWrapper">';
							     /* Start of Brightcove Player */
							    object += '<div style="display:none"></div>';
								object += '<object id="myExperience1195045806001" class="BrightcoveExperience">';
							    object += '<param name="bgcolor" value="#FFFFFF" />';
							    object += '<param name="width" value="100%" />';
							    object += '<param name="height" value="100%" />';
							    object += '<param name="playerID" value="681379754001" />';
							    object += '<param name="playerKey" value="AQ~~,AAAAnqZ-JnE~,l-xlfhf-vilirnU9Eb_Y6QFMJBZUa54T" />';
							    object += '<param name="isVid" value="true" />';
							    object += '<param name="isUI" value="true" />';
							    object += '<param name="dynamicStreaming" value="true" />';
							    object += '<param name="@videoPlayer" value="'+ $this.data("video") +'" />';
							         /* params for Smart Player API */
							    object += '<param name="includeAPI" value="true" />';
							    object += '<param name="templateLoadHandler" value="onTemplateLoaded" />';
							    object += '<param name="templateReadyHandler" value="onTemplateReady" />';
							    object += '</object></div></div>';
							    
							    $lightbox.append(object);
							    
							    brightcove.createExperiences();
								
								
							}
						// store the data from the clicked image on the lightbox
						// so we know where to animate the image to on close/advance 
					}).data($this.data());						
		        })
				
				// Cycle through images when a 
				// user clicks the image
		        $body.on("click", ".lightbox", function(e){
		        	if($(".lightbox #BCLcontainingBlock").length) { return false; } else {
			        	e.preventDefault();
			        	// clean out the contents
			        	$(".lightbox").empty();
			        	 var target = $(e.target);
						 if (target.is("#close")) { return false; } else {
							$("#close").remove();
				        	$lightbox.animate({
								left: $(this).data("left"),
								top: $(this).data("top"),
								width:$(this).data("width"),
								height:$(this).data("height") - $(window).scrollTop()
							}, duration, function(){
								var $this = $(".photo.hidden_content");
								$this.removeClass("hidden_content");
								if($this.next().index() === -1) {
									$(".photo:first-child .magnify").click();
								} else {
									$this.next().children(".magnify").click();
								}
							})
						}
						$(".quote_box").css({"top" : "0px"});
					}
				})
				
				// Close the image when a user clicks
				// close btn or outside of the image
				$body.on("click", "#close, #close_trigger", function(e){
		        	e.preventDefault();
		        	// clean out the contents
		        	$(".lightbox").empty();
			        $lightbox.animate({
						left: $lightbox.data("left"),
						top: $lightbox.data("top"),
						width:$lightbox.data("width"),
						height:$lightbox.data("height") - $(window).scrollTop()
					}, duration, function(){
						$(".hidden_content").removeClass("hidden_content");
						$lightbox.css({display:"none"});
						$("#close_trigger, #close").remove();
					})
					
					$(".quote_box").css({"top" : "0px"});
				})
				
				$body.on("click",".back", function(){
					$(carousel).unwrap();
				})


				
			});
		}
	});
})( jQuery );