var pills_y_top;
var header_fixer_height_index;
var main_menu_height;	// main navigation menu height for the in-page anchors offset



// update the variables
function updateValues() {
	pills_y_top = document.getElementById('stop-marquee').offsetTop;
	//console.log('pills_y_top: ' + pills_y_top);
	
	header_fixer_height_index = document.getElementById('header-fixed-top').clientHeight;
	//console.log('header_fixer_height_index: ' + header_fixer_height_index);

	main_menu_height = document.getElementById('main-nav-menu').clientHeight;
	
}



// marquee show/hide @ #pills
document.addEventListener('scroll', (e) => {
	//console.log("scrollY:" + window.scrollY);
	if(window.scrollY > getPillsYTop()) {
		//console.log(document.getElementById("marquee"));
		document.getElementById("marquee").classList.add("hidden");
	}
	else {
		document.getElementById("marquee").classList.remove("hidden");
	}
});


// add padding on top of #network for menu
function menuPaddingIndex() {
	document.getElementById('network-main').style.paddingTop = header_fixer_height_index + 'px';
}







// adapt the .anchors top position for nav anchor links
function updateAnchors() {
	var anchors = document.getElementsByClassName('anchors');
	
	//console.log(anchors);
	
	for(let i=0; i<anchors.length; i++) {
		anchors[i].style.top = - main_menu_height + 'px';
	}
	
}





// @page load at the beginning
updateValues();
menuPaddingIndex();
updateAnchors();


function getHeaderHeight() {
	updateValues();
	return header_fixer_height_index;
}


function getPillsYTop() {
	updateValues();
	return pills_y_top;
}



window.addEventListener('resize', (e) => {
	updateValues();
	menuPaddingIndex();
	updateAnchors();
});


// pills open/close
var pills = document.getElementById('pills-faq').children;

//console.log(pills);

var toggle = function(id) {
	// console.log(id);
	togglePills(id);
}

function togglePills(id) {
	document.getElementById(id).children[1].classList.toggle('hidden');
}

for(var i=1; i<pills.length; i++) {
	togglePills(pills[i].id);
	pills[i].addEventListener('click', toggle.bind(this, pills[i].id))
}


// protocols open/close
var listProto = document.getElementById('protocols-list').children;

//console.log(listProto);

function toggleProto(idP) {
	document.getElementById(idP).children[1].classList.toggle('hidden');
}

for(var i=0; i<listProto.length; i++) {
	toggleProto(listProto[i].id);
	listProto[i].addEventListener('click', toggle.bind(this, listProto[i].id))
}


// hamburger menu mobile

var hamburger = document.getElementById('hamburger-menu');

var menuToggle = function(id) {
	document.getElementById('menu-elements-toggle').classList.toggle('hidden-nav-menu');
}

hamburger.addEventListener('click', menuToggle.bind(this, hamburger.id));





// When the user clicks on <div>, open the popup
function myFunction() {
	var popup = document.getElementById("myPopup");
	popup.classList.toggle("show");
  }