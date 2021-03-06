/* 
 * Author: Team 17 (Chris Centenera, Evan Chen, Ching Choi, John Park, Ian Park)
 * Description: Game mechanics and screen transitions(for now) are located in here.
 */


/** 
 * Calculate the available screen real estate without the address bar and set it as the height.  
 */
function navBar() {
	var a = screen.height;
	var b = window.innerHeight;
	var difference =  a - ( (a - b) / 4 ) ;
	
	$('#gameContainer').css('height', Math.round(difference));
}
/** 
 * lockLevelButtons Changes class type of locked levels.
 * @return {undefined}
 */
function lockLevelButtons(){
	for(var i = 1; i <= 15;i++){
		if(difficultyNum == 0){
			if(i > levelStandardHigh){
				$('p#level' + i).removeClass('levelButton');
				$('p#level' + i).addClass('levelDeadBtn');
			} else {
				$('p#level' + i).removeClass('levelDeadBtn');
				$('p#level' + i).addClass('levelButton');
			}
		} else {
			if(i > levelAdvancedHigh){
				$('p#level' + i).removeClass('levelButton');
				$('p#level' + i).addClass('levelDeadBtn');
			} else {
				$('p#level' + i).removeClass('levelDeadBtn');
				$('p#level' + i).addClass('levelButton');
			}
		}
	}
}


/** 
 * screenChange Performs the screen change by setting css of previous screen to display:none and next screen to display:block
 * @return {none}
 */
function screenChange(screen) {
	var x = document.getElementsByTagName('section');
	for (var i = 0; i < x.length; i++) {
        x[i].style.display = 'none'; 
    }
    document.getElementById(screen).style.display = "block"; 
    if (screen == 'gameMode' || screen == 'levelSelect' || screen == 'mode3D' || screen == 'mode2D' || screen == 'answerScreen') {
    	document.getElementById("badges").style.display = "block";
    	if (difficultyNum == 0) {
    		updateBadge('standard', (levelStandardHigh - 1));
    	} else if (difficultyNum == 1) {
    		updateBadge('advanced', (levelAdvancedHigh - 1));
    	}
    } else {
		document.getElementById("badges").style.display = "none";
	}
}

/** 
 * Screen orientation change listener. 
 */
window.addEventListener('orientationchange', navBar, false);
/**
 * Window resize listener.
 */
window.onresize = resizeGame;


/**
 * levelLoad Loads the levels specifics once level is selected.
 * @param lowerBound The lowest foldout difficulty to be generated.
 * @param upperBound The highest foldout difficulty to be generated.
 * @param numAnswers The number of faces that the player needs to solve.
 * @return {undefined}
 */
function levelLoad(lowerBound, upperBound, numAnswers) {
	levels = [0,1,2,3,4,5,6,7,8,9];
	//Hard cap answer count to 5.
	if(numAnswers > 5){
		numAnswers = 5;
	}
	
	generatedLevel = Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound;
	
	foldoutT(levels[generatedLevel], numAnswers);
	applyFaces(levels[generatedLevel]);
	
	//Revert mode2D if user was viewing answer version.
	answerMode = false;
	$('#mode2D div.topNav').html('');
	$('#mode2D div.topNav').append('<button class="backButton buttonDesign floatLeft" onclick="modalOption(); buttonClick()"></button>'
									+ '<button class="buttonDesign floatRight" onclick="screenChange(\'mode3D\');">To 3D</button>');
	$('#mode2D div.bottomNav').html('');
	$('#mode2D div.bottomNav').append('<button id="colorArrow" class="buttonDesign floatLeft" onclick="colorChanger();">Color</button>'
									+ '<button id="mode2DSubmit" class="buttonDesign floatRight" onclick="validate();">Submit</button>');
}

/**
 * validate Tests user's arrow orientation vs true arrow orientation along with user's colors vs true colors.
 * 			If user's answers perfectly align, results screen displays success message. Otherwise it displays
 *			
 * @return {undefined}
 */
function validate(levelNumber){
	
	
	//Clears results screen along with answer screen before editing them.
	$('#resultMessage').html('');
	$('#correctAnswer').html('');
	var match = true;
	for(var i = 0; i< faces; i++){
		//Sets match to false if user has any combination wrong.
		if (getFace(faceNames[i]).trueValue != getFace(faceNames[i]).value){
			match = false;
		}
		
		//Only checks for color match on non-white faces.
		if(getFace(faceNames[i]).trueValue != 4){
			if(getFace(faceNames[i]).playerColor != getFace(faceNames[i]).trueColor){
				match = false;
			}
		}
	}

	
	//Appropriate message is displayed according to the result.
	if (match) {
		if(!getAchievement(1)){
			unlockFirstStep(match);
		} else {
			modalCorrect();
		}
		$('#resultMessage').append('Foldout is a perfect match!');
		if (standardMode) {
			// If the player is in standard mode, set the badges accordingly.
			setBadgeStandard();
		} else if (advancedMode) {
			// If the player is in advanced mode, set the badges accordingly.
			setBadgeAdvanced();
		}

		// Is currently selected mode the score attack mode?
		if(scoreModeFlag){
			//Score is determined by base and level multiplier.
			updateScore(scoreBase);
			//Give player additional time when level is completed.
			time += 30;
		}

		// Is currently selected mode the time attack mode?
		if(timeModeFlag){
			unlockSpeedy();
		}
		level++;
	} else {
		modalIncorrect();
		$('#resultMessage').append('Foldout does not match!');
		
		if(scoreModeFlag){
				//Score is determined by base and level multiplier.
				updateScore(-25);
		}

		if(timeModeFlag){
			//Penalty of 20 seconds is applied on wrong submission in time mode.
			time += 20;
		}
	}
}

/**
 * resizeGame Resizes the foldout according to the new screen size.
 * @return {undefined}
 */
function resizeGame(){
	//Resizes foldout depending on which screen you're on (Answer screen or mode2D screen)
	if($('#foldoutScreen').width() > $('#correctAnswer').width()){
		if($('#foldoutScreen').width() < $('#foldoutScreen').height()){
			axis = $('#foldoutScreen').width();
		} else {
			axis = $('#foldoutScreen').height();
		}
	} else {
		if($('#correctAnswer').width() < $('#correctAnswer').height()){
			axis = $('#correctAnswer').width();
		} else {
			axis = $('#correctAnswer').height();
		}
	}
	//Size is a portion of the screen to allow the full foldout to fit.
	size = Math.floor(axis/4);
	if($('#foldoutScreen').width() > $('#correctAnswer').width()){
		$('#foldout').css('border-collapse','collapse');
		$('#foldout tr td').children().css({'width': size, 'height': size, 'border': 'solid 5px black'});
		$('#foldout tr td div').children().css({'width': size, 'height': size});
	} else {
		$('#foldoutClone').css('border-collapse','collapse');
		$('#foldoutClone tbody tr td').children().css({'width': size, 'height': size, 'border': 'solid 5px black'});
		$('#foldoutClone tbody tr td div').children().css({'width': size, 'height': size});
	}
}

/**
 * colorChanger Turns on/off color changing flag.
 *				true = on, false = off
 * @return {undefined}
 */
function colorChanger(){
	colorFlag = !colorFlag;
	
	//Makes color button slightly transparent if flag is on.
	if(colorFlag) {
		$('#colorArrow').css('opacity', '0.4');
	} else {
		$('#colorArrow').css('opacity', '1');
	}
}

/**
 * setDifficulty Sets the difficulty of the game.
 *				 0 = Standard, match arrows only.
 *				 1 = Advanced, match arrows and colors.
 * @return {undefined}
 */
function setDifficulty(num){
	//Set difficulty to parameter if present.
	if(num){
		difficultyNum = parseInt(num);
	} else {
		//Default if no or invalid parameter.
		difficultyNum = (difficultyNum + 1) % 2;
	}
	switch(difficultyNum){
		case 0:
			difficulty = 'Mode: Standard'
			updateBadge('standard', levelStandardHigh - 1 );
			$('.levelsButton').css('background-color', 'initial');
			break;
		case 1:
			difficulty = 'Mode: Advanced'
			updateBadge('advanced', levelAdvancedHigh - 1 );
			$('.levelsButton').css('background-color', 'rgba(255,0,0,0.5)');
			break;
	}
	lockLevelButtons();
	$('#setDifficulty').text(difficulty);
}

/**
 * generatePivots Generates number of pivots on the cube depending on selected difficulty.
 * @param {integer} difficultyNum The difficulty selected, 0 = easy, 1 = medium, 2 = hard.
 * @return {undefined}
 */
function generatePivots(difficultyNum){
	var pivotCount = 0;
	var pivots = 0;
	switch(difficultyNum){
		case 0:
			pivotCount = 3;
			break;
		case 1:
			pivotCount = 2;
			break;
		case 2:
			pivotCount = 1;
			break;
	}
	//Make pivots proportional to difficulty chosen.
	while (pivots < pivotCount) {
		
		var pivot = Math.floor(Math.random() * faceArray.length);
		
		//Set chosen pivot to pivot properties.
		if(faceArray[pivot].trueColor != pivotColor){
			faceArray[pivot].trueColor = pivotColor;
			faceArray[pivot].playerColor = pivotColor;
			faceArray[pivot].trueValue = Math.floor(Math.random() * 4);
			faceArray[pivot].value = faceArray[pivot].trueValue;
			//Increment pivots when a new one is made.
			pivots++;
		}
	}
}
/**
 * compareAnswer Alters some game screens to be fit for comparing your answer to the real answer.
 * @return {undefined}
 */
function compareAnswer(){
	//Set flag so arrows are not rotatable.
	answerMode = true;
	
	$('#mode2D div.topNav').html('');
	$('#mode2D div.topNav').append('<button class="buttonDesign floatRight menuBSize" onclick="screenChange(\'answerScreen\');">Answer</button>');
	$('#mode2D div.topNav').append('<button class="buttonDesign floatLeft menuBSize" onclick="screenChange(\'mode3D\');">To 3D</button>');
	$('#mode2D div.bottomNav').html('');
	$('#mode2D div.bottomNav').append('<button class="buttonDesign floatRight menuBSize" onclick="lockLevelButtons(); screenChange(\'levelSelect\');resizeGame();">Levels</button>'
									+ '<button class="buttonDesign floatLeft menuBSize" onclick="screenChange(\'mainMenu\');resizeGame();">Menu</button>');
}