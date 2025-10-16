var slideshowSpeed = 4000;

var photos = [ {
		"title" : "",
		"image" : "H_Zimny_kat2.jpg",
		"url" : "",
		"firstline" : "",
		"secondline" : ""
	}, {
		"title" : "",
		"image" : "H_warnolty2.jpg",
		"url" : "",
		"firstline" : "",
		"secondline" : ""
	}, {
		"title" : "",
		"image" : "H_sniardwy_1.jpg",
		"url" : "",
		"firstline" : "",
		"secondline" : ""
	}, {
		"title" : "",
		"image" : "H_Zimny_kat3.jpg",
		"url" : "",
		"firstline" : "",
		"secondline" : ""
	},{
		"title" : "",
		"image" : "H_ocean1.jpg",
		"url" : "",
		"firstline" : "",
		"secondline" : ""
	},{
		"title" : "",
		"image" : "H_stpierr.jpg",
		"url" : "",
		"firstline" : "",
		"secondline" : ""
	},{
		"title" : "",
		"image" : "H_NaviBHeader.jpg",
		"url" : "",
		"firstline" : "",
		"secondline" : ""
	}		
];



$(document).ready(function() {
		
	$("#back").click(function() {
		stopAnimation();
		navigate("back");
	});
	
	$("#next").click(function() {
		stopAnimation();
		navigate("next");
	});
	
	var interval;
	$("#controls").toggle(function(){
		stopAnimation();
	}, function() {
		
		navigate("next");
		
		interval = setInterval(function() {
			navigate("next");
		}, slideshowSpeed);
	});
	
	
	var activeContainer = 1;	
	var currentImg = 0;
	var animating = false;
	var navigate = function(direction) {
		// Check if no animation is running. If it is, prevent the action
		if(animating) {
			return;
		}
		
		// Check which current image we need to show
		if(direction == "next") {
			currentImg++;
			if(currentImg == photos.length + 1) {
				currentImg = 1;
			}
		} else {
			currentImg--;
			if(currentImg == 0) {
				currentImg = photos.length;
			}
		}
		
		// Check which container we need to use
		var currentContainer = activeContainer;
		if(activeContainer == 1) {
			activeContainer = 2;
		} else {
			activeContainer = 1;
		}
		
		showImage(photos[currentImg - 1], currentContainer, activeContainer);
		
	};
	
	var currentZindex = -1;
	var showImage = function(photoObject, currentContainer, activeContainer) {
		animating = true;
		
		// Make sure the new container is always on the background
		currentZindex--;
		
		// Set the background image of the new active container

		$("#headerimg" + activeContainer).css({
			"background-image" : "url(../photo/" + photoObject.image + ")",
			"display" : "block",
			"z-index" : currentZindex
		});
		
		// Hide the header text
		$("#headertxt").css({"display" : "none"});
		
		// Set the new header text
		$("#firstline").html(photoObject.firstline);
		$("#secondline")
			.attr("href", photoObject.url)
			.html(photoObject.secondline);
		$("#pictureduri")
			.attr("href", photoObject.url)
			.html(photoObject.title);
		
		
		// Fade out the current container
		// and display the header text when animation is complete
		$("#headerimg" + currentContainer).fadeOut(function() {
			setTimeout(function() {
				$("#headertxt").css({"display" : "block"});
				animating = false;
			}, 200);
		});
	};
	
	var stopAnimation = function() {
		// Change the background image to "play"
		$("#control").css({ "background-image" : "" });//url(/layouts/unitechem/img/btn_play.png)//
		
		// Clear the interval
		clearInterval(interval);
	};
	
	// We should statically set the first image
	navigate("next");
	
	// Start playing the animation
	interval = setInterval(function() {
		navigate("next");
	}, slideshowSpeed);
	
});