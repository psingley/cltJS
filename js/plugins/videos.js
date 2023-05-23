// JavaScript Document
(function($){
	$.fn.extend({ 
		bcVideos:function() {  
			return this.each(function() {   
				// create lightbox template
				var $body = $("body"),
					lightbox = $("<div>", {"class":"video_lightbox"}),
					closeTrigger = $("<div>", {"id" : "close_video_trigger"}),
					close = $("<div>", {"id" : "close", "html" : "&times;"}),
					$lightbox;
					
				$body.on("click", ".video_thumb", function(e){
					e.preventDefault();
		        	
					var $this =	$(this),
						$videoTitle = $("<div>", {"class" : "video_title", "html" : $this.data("video-title")});
						$body.append(lightbox);
						$lightbox  = $(".video_lightbox");
			
					
					$body.append(closeTrigger);
					$lightbox.append(close);
								
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
				    object += '<param name="@videoPlayer" value="'+ $this.data("video-id") +'" />';
				         /* params for Smart Player API */
				    object += '<param name="includeAPI" value="true" />';
				    object += '<param name="templateLoadHandler" value="myTemplateLoaded" />';
				    object += '<param name="templateReadyHandler" value="cvOnTemplateReady" />';
				    object += '</object></div></div>';
				    
				    $lightbox.append(object);
				    $lightbox.append($videoTitle);
				    brightcove.createExperiences();
				});
		        
		        
				$body.on("click", "#close, #close_trigger", function(e){
		        	e.preventDefault();
		        	
		        	$lightbox.empty();
		        	// clean out the contents
		        	$(".video_lightbox").remove();
		        	$("#close_video_trigger").remove();
		        	$(".video_title").remove();
				})
					
				var myTemplateLoaded, cvOnTemplateReady, player, modVP, modExp, modCon;

				myTemplateLoaded = function (experienceID) {
					alert('myTemplatedLoaded function is called. Experience Id: ' + experienceID);
					player = brightcove.api.getExperience(experienceID);
					modVP = player.getModule(brightcove.api.modules.APIModules.VIDEO_PLAYER);
					modExp = player.getModule(brightcove.api.modules.APIModules.EXPERIENCE);
					modCon = player.getModule(brightcove.api.modules.APIModules.CONTENT);
				};

				cvOnTemplateReady = function (evt) {
					modVP.getCurrentVideo(function (dto) {
					});
					modVP.addEventListener(brightcove.api.events.MediaEvent.BEGIN, onMediaEventFired);
					modVP.addEventListener(brightcove.api.events.MediaEvent.CHANGE, onMediaEventFired);
					modVP.addEventListener(brightcove.api.events.MediaEvent.COMPLETE, onMediaEventFired);
					modVP.addEventListener(brightcove.api.events.MediaEvent.ERROR, onMediaEventFired);
					modVP.addEventListener(brightcove.api.events.MediaEvent.PLAY, onMediaEventFired);
					modVP.addEventListener(brightcove.api.events.MediaEvent.PROGRESS, onMediaProgressFired);
					modVP.addEventListener(brightcove.api.events.MediaEvent.STOP, onMediaEventFired);
				};

				function onMediaEventFired(evt) {
					console.log("MEDIA EVENT: " + evt.type + " fired at position: " + evt.position);
					//document.getElementById("eventLog").innerHTML += "MEDIA EVENT: " + evt.type + " fired at position: " + evt.position + "<BR>";
				};

				function onMediaProgressFired(evt) {
					console.log("CURRENT POSITION: " + evt.position);
					//document.getElementById("positionLog").innerHTML = "CURRENT POSITION: " + evt.position;
				};
			});
		}
	});
})( jQuery );