var context = cast.framework.CastReceiverContext.getInstance();
var NAMESPACE = "urn:x-cast:com.gware.puzzlestreak.game";

var modeTitle = document.getElementById("modeTitle");
var modeSubtitle = document.getElementById("modeSubtitle");
var roundValue = document.getElementById("roundValue");
var streakValue = document.getElementById("streakValue");
var bestValue = document.getElementById("bestValue");

var wordsPanel = document.getElementById("wordsPanel");
var wordsStatus = document.getElementById("wordsStatus");
var wordsGrid = document.getElementById("wordsGrid");
var wordsMeta = document.getElementById("wordsMeta");

var numbersPanel = document.getElementById("numbersPanel");
var numbersStatus = document.getElementById("numbersStatus");
var numbersTarget = document.getElementById("numbersTarget");
var numbersSources = document.getElementById("numbersSources");
var numbersRows = document.getElementById("numbersRows");
var numbersActive = document.getElementById("numbersActive");

var knowledgePanel = document.getElementById("knowledgePanel");
var knowledgeCategory = document.getElementById("knowledgeCategory");
var knowledgeStatus = document.getElementById("knowledgeStatus");
var knowledgeEntries = document.getElementById("knowledgeEntries");
var knowledgeMeta = document.getElementById("knowledgeMeta");

function setSubtitle(message) {
  modeSubtitle.textContent = message;
}

function normalizeLabel(value) {
  return String(value || "").split("_").join(" ");
}

function setStatusPill(element, status) {
  var normalized = normalizeLabel(status || "IN_PROGRESS");
  element.textContent = normalized;
  if (status === "WON") {
    element.style.color = "var(--good)";
  } else if (status === "LOST" || status === "FAILED") {
    element.style.color = "var(--accent)";
  } else {
    element.style.color = "var(--warn)";
  }
}

function renderWords(words) {
  var rows;
  var guessIndex;
  var row;
  var i;

  wordsPanel.hidden = false;
  setStatusPill(wordsStatus, words.status);
  wordsGrid.innerHTML = "";

  rows = words.guesses.slice();
  if (words.currentEntry) {
    rows.push(words.currentEntry);
  }
  while (rows.length < 6) {
    rows.push("");
  }

  for (guessIndex = 0; guessIndex < rows.length; guessIndex += 1) {
    row = document.createElement("div");
    row.className = "word-row";
    for (i = 0; i < words.wordLength; i += 1) {
      var tile = document.createElement("div");
      tile.className = "tile" + (rows[guessIndex][i] ? " filled" : "");
      tile.textContent = rows[guessIndex][i] || "";
      row.appendChild(tile);
    }
    wordsGrid.appendChild(row);
  }

  wordsMeta.textContent = words.guessesRemaining + " guesses remaining";
}

function renderNumbers(numbers) {
  var valueIndex;
  var expressionIndex;

  numbersPanel.hidden = false;
  setStatusPill(numbersStatus, numbers.status);
  numbersTarget.textContent = numbers.targetNumber;
  numbersSources.innerHTML = "";
  numbersRows.innerHTML = "";

  for (valueIndex = 0; valueIndex < numbers.sourceNumbers.length; valueIndex += 1) {
    var chip = document.createElement("div");
    chip.className = "number-chip";
    chip.textContent = String(numbers.sourceNumbers[valueIndex]);
    numbersSources.appendChild(chip);
  }

  if (numbers.submittedExpressions.length === 0) {
    var empty = document.createElement("li");
    empty.className = "expression-item";
    empty.textContent = "No submitted lines yet.";
    numbersRows.appendChild(empty);
  } else {
    for (expressionIndex = 0; expressionIndex < numbers.submittedExpressions.length; expressionIndex += 1) {
      var item = document.createElement("li");
      item.className = "expression-item";
      item.textContent = numbers.submittedExpressions[expressionIndex];
      numbersRows.appendChild(item);
    }
  }

  numbersActive.textContent = numbers.activeExpression
    ? "Current line: " + numbers.activeExpression
    : "Current line is still being entered.";
}

function renderKnowledge(knowledge) {
  var index;

  knowledgePanel.hidden = false;
  setStatusPill(knowledgeStatus, knowledge.status);
  knowledgeCategory.textContent = knowledge.category
    ? knowledge.category + " Trivia"
    : "Trivia Round";
  knowledgeEntries.innerHTML = "";

  for (index = 0; index < knowledge.entries.length; index += 1) {
    var entry = knowledge.entries[index];
    var item = document.createElement("div");
    var clue = document.createElement("p");
    var answer = document.createElement("p");

    item.className = "knowledge-item" + (entry.active ? " active" : "");

    clue.className = "knowledge-clue";
    clue.textContent = (index + 1) + ". " + entry.clue;

    answer.className = "knowledge-answer";
    answer.textContent = entry.solvedAnswer
      ? "Solved: " + entry.solvedAnswer
      : "Answer length: " + entry.answerLength;

    item.appendChild(clue);
    item.appendChild(answer);
    knowledgeEntries.appendChild(item);
  }

  knowledgeMeta.textContent = knowledge.currentEntry
    ? "Current entry: " + knowledge.currentEntry
    : "Working on clue " + (knowledge.activeEntryIndex + 1);
}

function renderState(state) {
  modeTitle.textContent = normalizeLabel(state.mode);
  modeSubtitle.textContent = "Live group play screen";
  roundValue.textContent = state.roundNumber;
  streakValue.textContent = state.currentStreak;
  bestValue.textContent = state.bestStreak;

  wordsPanel.hidden = true;
  numbersPanel.hidden = true;
  knowledgePanel.hidden = true;

  if (state.mode === "WORDS" && state.words) {
    renderWords(state.words);
  }
  if (state.mode === "NUMBERS" && state.numbers) {
    renderNumbers(state.numbers);
  }
  if (state.mode === "KNOWLEDGE" && state.knowledge) {
    renderKnowledge(state.knowledge);
  }
}

context.addCustomMessageListener(NAMESPACE, function(event) {
  try {
    var state = JSON.parse(event.data);
    setSubtitle("Live group play screen");
    renderState(state);
  } catch (error) {
    console.error("Failed to parse PuzzleStreak cast state", error);
    setSubtitle("Unable to parse game state.");
  }
});

window.addEventListener("error", function(event) {
  var details = event.message || (event.error && event.error.message) || "Unknown receiver error";
  console.error("Receiver runtime error", event.error || event.message);
  setSubtitle("Receiver error: " + details);
});

context.start({
  disableIdleTimeout: true,
  customNamespaces: (function() {
    var namespaces = {};
    namespaces[NAMESPACE] = cast.framework.system.MessageType.STRING;
    return namespaces;
  }()),
});
