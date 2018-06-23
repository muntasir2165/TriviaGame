$(document).ready(function() {
	$("#start-game").on("click", function(){
		displayStartButton(false);
		displayGameInfo(true);
		startTrivia();
		console.log("Game Started!");
	});
});

// object tracking the game state, current trivia question and game statistics
// every property inside the object is initialized to 0, empty string, or []
var gameInfo = {"correctAnswerTotal": 0,
	"incorrectAnswerTotal": 0,
	"unansweredTotal": 0,
	"triviaArray": [],
	"currentQuestionObject": {},
	"timePerQuestion": 10,
	"timeLeft": 10,
	"intervalTimerId": 0
};

function initializeGameInfo() {
	gameInfo = {"correctAnswerTotal": 0,
	"incorrectAnswerTotal": 0,
	"unansweredTotal": 0,
	"triviaArray": [],
	"currentQuestionObject": {},
	"timePerQuestion": 10,
	"timeLeft": 10,
	"intervalTimerId": 0
	}
}

function displayStartButton(condition) {
	var visibility;
	if (condition === true) {
		visibility = "visible";
	} else {
		visibility = "hidden";
		displayGameFeedback(false);
	}
	$("#start-game").attr("style", "visibility:" + visibility);
}

function displayGameInfo(condition) {
		var visibility;
		if (condition === true) {
			visibility = "visible";
		} else {
			visibility = "hidden";
		}
		$("#timer-container").attr("style", "visibility:" + visibility);
		$("#game-statistics").attr("style", "visibility:" + visibility);
		$("#question-container").attr("style", "visibility:" + visibility);
		$("#answer-choices-container").attr("style", "visibility:" + visibility);
}

function displayGameFeedback(condition, feedback) {
	if (condition === true) {
		$("#game-feedback-container").attr("style", "visibility: visible");
		$("#game-feedback-container").text(feedback);
	} else {
		$("#game-feedback-container").attr("style", "visibility: hidden");
		$("#game-feedback-container").text("");
	}
}

function inGameFeedback(questionFeedback, correctAnswer) {
	switch(questionFeedback) {
    case "correct":
        displayGameFeedback(true, "Correct! It is: " + correctAnswer);
        break;
    case "incorrect":
        displayGameFeedback(true, "Wrong! The correct answer is: " + correctAnswer);
        break;
    case "unanswered":
        displayGameFeedback(true, "Unanswered. The correct answer is: " + correctAnswer);
        break;
	}
	setTimeout(displayGameFeedback, 5  * 1000, false);
}

function updateGameStatistics() {
	$("#correct-answer-total").text(gameInfo["correctAnswerTotal"]);
	$("#questions-remaining").text(gameInfo["triviaArray"].length);
	$("#unanswered-total").text(gameInfo["unansweredTotal"]);
	$("#incorrect-answer-total").text(gameInfo["incorrectAnswerTotal"]);
}

function startTrivia() {
	var numberOfQuestions = 10;
	var difficulty = "easy";
	var triviaType = "multiple";
	triviaQuestionUrl = "https://opentdb.com/api.php?amount="+ numberOfQuestions + "&difficulty=" + difficulty + "&type=" + triviaType;
	// console.log(triviaQuestionUrl);
	// search the Open Trivia Database (https://opentdb.com/) for a list of trivia questions that match the selected parameter criteria
	$.ajax({
		url: triviaQuestionUrl,
		success: function(result) {
			var triviaDataArray = result["results"];
			//intialize the questionArray property variable of gameInfo to be an empty 
			// array if it wasn't empty already
			gameInfo.triviaArray = [];

			triviaDataArray.forEach(function(triviaData){
			var trivia = {};
			trivia["question"] = triviaData["question"];
			trivia["correct_answer"] = triviaData["correct_answer"];
			trivia["incorrect_answers"] = triviaData["incorrect_answers"];
			gameInfo["triviaArray"].push(trivia);
			});

			playGame();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			alert("Sorry, invalid request.");
			console.log("textStatus: " + textStatus + " errorThrown: " + errorThrown);
		}
	});
}

function playGame() {
	// console.log("Executing the playGame() function");
	restartTimer();
	updateGameStatistics();
	triviaQuestion();
}

function startTimer() {
    gameInfo.intervalTimerId = setInterval(countDownTimer, 1000);
}

function stopTimer() {
    clearInterval(gameInfo.intervalTimerId);
}

function countDownTimer() {
	if (gameInfo.timeLeft >= 0) {
		displayTimeLeft();
	} else {
		displayTimeLeft("-");
		incrementUnAnsweredTotalCount();
		inGameFeedback("unanswered", gameInfo["currentQuestionObject"]["correct_answer"]);
		playGame();
	}
}

function restartTimer() {
	stopTimer();
	resetTimer();
	startTimer();
}

function displayTimeLeft(text) {
	if (text) {
		$("#timer").text(text);
	} else {
		$("#timer").text(gameInfo.timeLeft--);
	}
}

function resetTimer() {
	gameInfo.timeLeft = gameInfo.timePerQuestion;
}

function triviaQuestion() {
	// console.log("Executing the triviaQuestion() function");
	if (gameInfo["triviaArray"].length > 0) {
		gameInfo["currentQuestionObject"] = gameInfo["triviaArray"].shift();
		displayTrivia(gameInfo["currentQuestionObject"]);
	} else {
		displayGameInfo(false);
		displayGameFeedback(true, "Correct Answers: " + gameInfo.correctAnswerTotal + "; Unanswered: " + gameInfo.unansweredTotal + "; Incorrect Answers: " + gameInfo.incorrectAnswerTotal);
		stopTimer();
		initializeGameInfo();
		// displayStartButton(true);
		// display the start button after 3 seconds that the last game 
		// statistics were up for display
		setTimeout(displayStartButton, 3  * 1000, true);
	}
}

	// display trivia question on the screen
	function displayTrivia(questionObject) {
		// console.log("Executing the displayTrivia() function");
		displayQuestion(questionObject["question"]);
		displayAnswerChoices(questionObject["incorrect_answers"], questionObject["correct_answer"]);
	}

	function displayQuestion(question) {
		// console.log("Executing the displayQuestion() function");
		var questionContainer = $("#question-container");
		// questionContainer.empty();
		questionContainer.html(question);
	}

	function displayAnswerChoices(wrongAnswerChoiceArray, rightAnswer) {
		// console.log("Executing the displayAnswerChoices() function");
		var answerChoiceArray = wrongAnswerChoiceArray.slice();
		answerChoiceArray.push(rightAnswer);
		// console.log the right answer (for debugging and perhaps cheating purposes!)
		console.log(rightAnswer);
		
		var shuffledAnswerChoiceArray = shuffle(answerChoiceArray);

		var answerChoicesContainer = $("#answer-choices-container");
		answerChoicesContainer.empty(); 
		$.each(shuffledAnswerChoiceArray, function (index, answer) {
			var answerButton = $("<button>");
			answerButton.addClass("answer-choice btn btn-warning");
			answerButton.attr("data-answer", answer);
			answerButton.html(answer);
			answerChoicesContainer.append(answerButton);
			answerChoicesContainer.append($("<br>")).append($("<br>"));
		});

		evaluateClickedAnswer();
	}

function evaluateClickedAnswer() {
	$(".answer-choice").on("click", function(){
		displayTimeLeft("-");
		var answer = $(this).attr("data-answer");
		if (answer === gameInfo["currentQuestionObject"]["correct_answer"]) {
			incrementCorrectAnswerTotalCount();
			inGameFeedback("correct", gameInfo["currentQuestionObject"]["correct_answer"]);
		} else {
			incrementIncorrectAnswerTotalCount();
			inGameFeedback("incorrect", gameInfo["currentQuestionObject"]["correct_answer"]);
		}
		updateGameStatistics();
		playGame();
	});
}

function incrementCorrectAnswerTotalCount() {
	gameInfo["correctAnswerTotal"]++;
}

function incrementIncorrectAnswerTotalCount() {
	gameInfo["incorrectAnswerTotal"]++;
}

function incrementUnAnsweredTotalCount() {
	gameInfo["unansweredTotal"]++;
}

// Fisher-Yates (aka Knuth) Shuffle algorithm implementation to shuffle trivia question answer choices
// Copied from stackoverflow post: 
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}