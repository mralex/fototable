var response = "";
var savedSearch = "";
var maxImgs = 20;
var lastX = 0;
var lastY = 0;
var xM = 0;
var yM = 0;
var realx = 0;
var realy = 0;
var imgs = [];
var licenses = null;
var shift = false;
var lightboxOn = false;
$(function() {
	licenses = [[0,0],["by-nc-sa","cc "],["by-nc","cc "],["by-nc-nd","cc "],["by","cc "],["by-sa","cc "],["by-nd","cc "],["No copyright",null]];
	
	$(document).keydown(function(e) {
		if (e.keyCode == '16') shift = true;
	});
	
	$(document).keyup(function(e) {
		shift = false;
	})
	
	imgs.maxZ = function() {
		var z = 0;
		for (var i = 0; i < this.length; i++) {
			var curZ = parseInt(this[i][0].style.zIndex);
			if (curZ > z) z = curZ;
		}
		return z;
	}
	imgs.updateZ = function(originZ) {
		if (originZ == this.maxZ()) return;
		
		for (var i = 0; i < this.length; i++) {
			var curZ = parseInt(this[i][0].style.zIndex);
			
			if (curZ >= originZ) {
				var z = curZ;
				this[i][0].style.zIndex = z--;
			}
		}
	}
	
	function topY() { return (window.scrollY || document.body.clientTop); }
	
	$("#sF").submit(function() {
		// alert(e.value);
		var r = $("#results");
		
		r.html("");
		
		if ($("#s").val() == "") { 
			// $("#results").html("Enter a query!");
			// 			return false;
			$("#s").val("kitten");
		}
		localStorage.setItem("savedSearch", $("#s").val());
		
		var loading = $('<div/>').addClass('loading').html('Loading...');
		r.append(loading);

		loading[0].style.left = ((r.width() / 2) - 50) + "px";
		loading[0].style.top = (topY() + ($(document).height() / 2) - (loading[0].offsetHeight * 2)) + "px";
		
		
		$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=c46c70cb3c3203b4688264aad861e228&text="+ escape($("#s").val()) +"&format=json&jsoncallback=?", function(data) {
			// loading.detach();
			r.html('');
			response = data;
			var len = data.photos.photo.length;
			
			var w = $(document).width() - 300;	
			var w2 = w/2;
			//
			//console.log(w);
			
			var photosUsed = Array();
			for (var i = 0; i < maxImgs; i++) {
				do {
					var n = Math.floor(Math.random() * len);
				} while(photosUsed.indexOf(n) > -1);
				photosUsed.push(n);
				
				var item = data.photos.photo[n];
				
				//http://farm{farm-id}.static.flickr.com/{server-id}/{id}_{secret}_[mstb].jpg
				var img = $("<img/>").attr("src", "http://farm"+ item.farm +".static.flickr.com/"+item.server+"/"+item.id+"_"+item.secret+"_m.jpg");
				var top = Math.floor(Math.random() * 500);
				var left = Math.floor(Math.random() * w); //100 + (Math.random() * 1024);
				
				img[0].rotate = function() {
					var left = parseInt(this.style.left);
					var d = 70;
					
					var rotation;
					if (left > w2) {
						// rotate to the right
						rotation = Math.floor(((left - w2) /w2) * d);
					} else {
						// rotate to the left
						rotation = Math.floor(-(((left/w2) * -d) + d));
					
					}
					
					// matrix transform for ie
					if ($.browser.msie) {
						rad = rotation * (Math.PI * 2 / 360);
						costheta = Math.cos(rad);
					   sintheta = Math.sin(rad);

					   this.style.filter = this.style['-ms-filter'] = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+")";
						this.style.filter += "-filter: progid:DXImageTransform.Microsoft.Shadow(color=#80000000,direction=180,strength=5);";
					} else {					
						this.style.webkitTransform = "rotate("+ rotation +"deg)";
						this.style.MozTransform = "rotate("+ rotation +"deg)";
					}
				};
				
				img.addClass("photo");
				img.attr("style", "top:" + top + "px; left:" + left + "px; z-index:" + imgs.length);
				
				img[0].rotate();

				img[0].item = item;
				
				// img.mouseout(function(e) {
				// 	this.onmousemove = null;
				// })

				imgs.push(img);
	         img.appendTo("#results");
			}
		});
		
		return false;
	});
	
	// Drag and drop http://luke.breuer.com/tutorial/javascript-drag-and-drop-tutorial.aspx
	document.onmousedown = function(e) { 
		var t = e.target;
		if (!$(t).hasClass("photo")) return;
		
		var _sx = e.pageX;
		var _sy = e.pageY;
		var _ox = parseInt(t.style.left);
		var _oy = parseInt(t.style.top);
		
		t.moved = false;
		
		// move selected item to the top of the pile
		imgs.updateZ(t.style.zIndex);
		t.style.zIndex = imgs.maxZ() + 1;
		t.style.webkitBoxShadow = "0 0 30px rgba(0, 0, 0, 0.9)";
		t.style.MozBoxShadow = "0 0 30px rgba(0, 0, 0, 0.9)";
		t.style.boxShadow = "0 0 30px rgba(0, 0, 0, 0.9)";
		t.style.borderColor = "#007be9";
		
		document.onmousemove = function(e) {
			t.style.left = ((window.scrollX || document.body.scrollTop) + _ox + e.clientX - _sx + 'px');
			t.style.top = (topY() + _oy + e.clientY - _sy + 'px');
			t.moved = true;
			if (!shift) t.rotate();
		}
		
		document.body.focus();
		document.onselectstart = function() { return false; };
		t.ondragstart = function() { return false; };

		return false; 
	};

	document.onmouseup = function(e) { 
		var t = e.target;
		if (!$(t).hasClass("photo")) return;
		
		document.onmousemove = null;
		document.onselectstart = null;
		t.ondragstart = null;
		t.style.borderColor = "#fff";
		t.style.webkitBoxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
		t.style.MozBoxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
		t.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
		
		if (!t.moved) {
			// display lightbox
			lightbox(function(full) {
				item = t.item;
				var photoUrl = "http://flickr.com/photos/"+item.owner +"/"+item.id;

				var img = $("<img>").attr("src", "http://farm"+ item.farm +".static.flickr.com/"+item.server+"/"+item.id+"_"+item.secret+".jpg");
				full.html($("<div/>").addClass("pz").append($("<a/>").attr("href",photoUrl).append(img)));

				full.append("<h2><a href='"+ photoUrl +"'>" + item.title + "</a></h2>");

				full.append('<p id="fullMeta">Loading details...</p>');

				$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=c46c70cb3c3203b4688264aad861e228&photo_id="+ item.id +"&format=json&jsoncallback=?", function(photoData) { 

					$.getJSON("http://api.flickr.com/services/rest/?method=flickr.people.getInfo&api_key=c46c70cb3c3203b4688264aad861e228&user_id="+ photoData.photo.owner.nsid +"&format=json&jsoncallback=?", function(data) { 
						response = data;

						var name = ((data.person.realname && (data.person.realname._content != "")) ? data.person.realname._content : data.person.username._content);
						$("#fullMeta").html('<p class="by">By: <a href="'+ data.person.photosurl._content +'">' + name + "</a></p>");

						// Licensing info
						var license = photoData.photo.license;
						if (license == 0) { full.append('<p class="license">All rights reserved</p>'); return; }

						var licenseUrl = (license != 7) ? "http://creativecommons.org/licenses/"+licenses[license][0]+"/2.0" : "http://flickr.com/commons/usage/";
						full.append('<p class="license"><a href="' + licenseUrl + '" rel="license">'+licenses[license][1]+licenses[license][0]+'</a></p>');
					});
				});
			});
		}
		
		return false; 
	};
	
	$("#help").click(function() {
		lightbox(function(f) {
			f.html('<header><h1>FotoTable</h1><p><small>By <a href="http://redprocess.com">Alex Roberts</a></small></p></header><section><p>An HTML5/CSS3 light table app, supporting Safari 5, Chrome 5, Firefox 3.6, and IE9.</p><p><strong>Tip:</strong> Hold down <em>shift</em> while dragging a photo to constrain its angle!</p></section><section><h4>Known Issues</h4><ul><li>At this time TypeKit appears to not function with IE9 Dev Release</li><li>IE9 doesn\'t support box-shadow on rotated objects, Shadow filter used instead.</li></ul></section>');
		})
	})
	
	savedSearch = localStorage.getItem('savedSearch');
	if (savedSearch != null) {
		$("#s").val(savedSearch);
	} else {
		$("#s").val("token cat");
	}
	$("#sF").submit();
	
	function lightbox(c) {
		if (lightboxOn) return;
		
		lightboxOn = true;
		var lightbox;
		var overlay;
		var full;

		lightbox = $("<div/>").attr("id", "lightbox");
		overlay = $("<div/>").attr("id", "overlay");
		full = $("<div/>");
		lightbox.append(overlay);
		lightbox.append(full);
		$("body").append(lightbox);
		lightbox.fadeIn(100);

		full.attr("id", "full");
		full.attr("style", "left:" + ((document.body.clientWidth / 2) - 250) + "px; top: " + (topY() + 100) + "px;");

		c(full);

		lightbox.click(function(e) {
			lightbox.fadeOut(200, function() {	$(this).detach(); });
			lightboxOn = false;
		})
	}
});
