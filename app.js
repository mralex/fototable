var response = "";
var savedSearch = "";
var maxImgs = 20;
var lastX = 0;
var lastY = 0;
var xM = 0;
var yM = 0;
var realx = 0;
var realy = 0;
$(function() {
	$("#sF").submit(function() {
		// alert(e.value);
		if ($("#s").val() == "") { 
			// $("#results").html("Enter a query!");
			// 			return false;
			$("#s").val("kitten");
		}
		localStorage.setItem("savedSearch", $("#s").val());
		
		$("#results").html("Loading...");
		
		$.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=c46c70cb3c3203b4688264aad861e228&text="+ $("#s").val() +"&format=json&jsoncallback=?", function(data) {
			$("#results").html("Loaded! ("+ data.photos.photo.length +")<br/>");
			response = data;
			var len = data.photos.photo.length;
			var imgs = [];
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
			
			var w = $(document).width() - 300;	
			var w2 = w/2;
			console.log(w);
			
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

				var rotation;
				if (left > w2) {
					// rotate to the right
					// ((100/500) * 80)
					// (((left - w2) / w2) * 80)
					rotation = Math.floor((Math.random() * (((left - w2) / w2) * 80)));
				} else {
					// rotate to the left
					// -(((left/w2) * -80) + 80)
					rotation = Math.floor((Math.random() * -(((left/w2) * -80) + 80)));
					
				}
				img.attr("style", "position:absolute; top:" + top + "px; left:" + left + "px; -webkit-transform:rotate("+rotation+"deg); border:5px solid rgba(255, 255, 255, 0.8); -webkit-box-shadow:0px 0px 10px rgba(0, 0, 0, 0.5); z-index:" + imgs.length);
				
				img[0].item = item;
				
				img.mouseout(function(e) {
					this.onmousemove = null;
				})
				img.mousedown(function(e) { 
					var _sx = e.pageX;
					var _sy = e.pageY;
					var _ox = parseInt(this.style.left);
					var _oy = parseInt(this.style.top);
					
					this.moved = false;
					
					// move selected item to the top of the pile
					imgs.updateZ(this.style.zIndex);
					this.style.zIndex = imgs.maxZ() + 1;
					
					this.style.borderColor = "rgba(0, 0, 255, 0.8)";
							
					document.body.focus();
					document.onselectstart = function() { return false; };
					this.ondragstart = function() { return false; };
					
					this.onmousemove = function(e) {
						this.style.left = (window.scrollX + _ox + e.clientX - _sx + 'px');
						this.style.top = (window.scrollY + _oy + e.clientY - _sy + 'px');
						this.moved = true;
					}

					return false; });

				img.mouseup(function(e) { 
					this.onmousemove = null;
					this.style.borderColor = "rgba(255, 255, 255, 0.8)";
					
					if (!this.moved) {
						var overlay;
						var full;
						if ($("#full").length == 0) {
							overlay = $("<div/>").attr("id", "overlay");
							full = $("<div/>");
							overlay.append(full);
							$("body").append(overlay);
							overlay.fadeIn(100);
						} else {
							full = $("#full");
						}

						full.attr("id", "full");
						full.attr("style", "position: absolute; background-color: #fff; width: 500px; z-index:10000; -webkit-box-shadow: 0 6px 10px #111; border: 5px solid #fff; left:" + ((document.body.clientWidth / 2) - 250) + "px; top: 100px;");

						item = this.item;

						var img = $("<img/>").attr("src", "http://farm"+ item.farm +".static.flickr.com/"+item.server+"/"+item.id+"_"+item.secret+".jpg");
						full.html(img);
						full.append("<h2><a href='http://flickr.com/photos/"+item.owner +"/"+item.id+"'>" + item.title + "</a></h2>");

						overlay.click(function(e) {
							$("#overlay").fadeOut(200, function() {	$(this).detach(); });
						})
					}
					
					return false; });
				
				img.dblclick(function(e) {
					// var overlay;
					// var full;
					// if ($("#full").length == 0) {
					// 	overlay = $("<div/>").attr("id", "overlay");
					// 	full = $("<div/>");
					// 	overlay.append(full);
					// 	$("body").append(overlay);
					// } else {
					// 	full = $("#full");
					// }
					// 
					// full.attr("id", "full");
					// full.attr("style", "position: absolute; background-color: #fff; width: 500px; z-index:10000; -webkit-box-shadow: 0 6px 10px #111; border: 5px solid #fff; left:" + ((document.body.clientWidth / 2) - 250) + "px; top: 100px;");
					// 
					// item = this.item;
					// 
					// var img = $("<img/>").attr("src", "http://farm"+ item.farm +".static.flickr.com/"+item.server+"/"+item.id+"_"+item.secret+".jpg");
					// full.html(img);
					// full.append("<h2><a href='http://flickr.com/photos/"+item.owner +"/"+item.id+"'>" + item.title + "</a></h2>");
					// 
					// overlay.click(function(e) {
					// 	$("#overlay").detach();
					// })
					
					return false;
				});
				
				imgs.push(img);
	            img.appendTo("#results");
			}
		});
		
		return false;
	});
	
	savedSearch = localStorage.getItem('savedSearch');
	if (savedSearch != null) {
		$("#s").val(savedSearch);
		$("#sF").submit();
	}
});