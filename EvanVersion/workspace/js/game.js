/* The easter egg */
var count = 0;
function tutturu(){
    var audio = new Audio('./workspace/audio/tuturu-century-fox.mp3');
    count++;
	if (count == 10) {
		audio.play();
		count = 0;
	}
	
}
/*window.setTimeout(scrollDown, 100);*/


/* Calculate the available screen real estate without the address bar and set it as the height  */
function navBar() {
	var a = screen.height;
	var b = window.innerHeight;
	var difference =  a - ( (a - b) / 4 ) ;	
	$('#gameContainer').css('height', difference);
	
}

/* The screen changing function */
function screenChange(current, next) {
	document.getElementById(next).style.display = "block";
	document.getElementById(current).style.display = "none";
}

