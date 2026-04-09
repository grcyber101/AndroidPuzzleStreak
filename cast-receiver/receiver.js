const context = cast.framework.CastReceiverContext.getInstance();
const NAMESPACE = "urn:x-cast:com.gware.puzzlestreak.game";

const modeTitle = document.getElementById("modeTitle");
const modeSubtitle = document.getElementById("modeSubtitle");
const roundValue = document.getElementById("roundValue");
const streakValue = document.getElementById("streakValue");
const bestValue = document.getElementById("bestValue");

const wordsPanel = document.getElementById("wordsPanel");
const wordsStatus = document.getElementById("wordsStatus");
const wordsGrid = document.getElementById("wordsGrid");
const wordsMeta = document.getElementById("wordsMeta");

const numbersPanel = document.getElementById("numbersPanel");
const numbersStatus = document.getElementById("numbersStatus");
const numbersTarget = document.getElementById("numbersTarget");
const numbersSources = document.getElementById("numbersSources");
const numbersRows = document.getElementById("numbersRows");
const numbersActive = document.getElementById("numbersActive");

const knowledgePanel = document.getElementById("knowledgePanel");
const knowledgeCategory = document.getElementById("knowledgeCategory");
const knowledgeStatus = document.getElementById("knowledgeStatus");
const knowledgeEntries = document.getElementById("knowledgeEntries");
const knowledgeMeta = document.getElementById("knowledgeMeta");

function setSubtitle(message) {
  modeSubtitle.textContent = message;
}

function normalizeLabel(value) {
  return String(value || "").split("_").join(" ");
}

function setStatusPill(element, status) {
  const normalized = normalizeLabel(status || "IN_PROGRESS");
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
  wordsPanel.hidden = false;
  setStatusPill(wordsStatus, words.status);
  wordsGrid.innerHTML = "";

  const rows = [...words.guesses];
  if (words.currentEntry) rows.push(words.currentEntry);
  while (rows.length < 6) rows.push("");

  rows.forEach((guess) => {
    const row = document.createElement("div");
    row.className = "word-row";
    for (let i = 0; i < words.wordLength; i += 1) {
      const tile = document.createElement("div");
      tile.className = `tile${guess[i] ? " filled" : ""}`;
      tile.textContent = guess[i] || "";
      row.appendChild(tile);
    }
    wordsGrid.appendChild(row);
  });

  wordsMeta.textContent = `${words.guessesRemaining} guesses remaining`;
}

function renderNumbers(numbers) {
  numbersPanel.hidden = false;
  setStatusPill(numbersStatus, numbers.status);
  numbersTarget.textContent = numbers.targetNumber;
  numbersSources.innerHTML = "";
  numbersRows.innerHTML = "";

  numbers.sourceNumbers.forEach((value) => {
    const chip = document.createElement("div");
    chip.className = "number-chip";
    chip.textContent = String(value);
    numbersSources.appendChild(chip);
  });

  if (numbers.submittedExpressions.length === 0) {
    const empty = document.createElement("li");
    empty.className = "expression-item";
    empty.textContent = "No submitted lines yet.";
    numbersRows.appendChild(empty);
  } else {
    numbers.submittedExpressions.forEach((expression) => {
      const item = document.createElement("li");
      item.className = "expression-item";
      item.textContent = expression;
      numbersRows.appendChild(item);
    });
  }

  numbersActive.textContent = numbers.activeExpression
    ? `Current line: ${numbers.activeExpression}`
    : "Current line is still being entered.";
}

function renderKnowledge(knowledge) {
  knowledgePanel.hidden = false;
  setStatusPill(knowledgeStatus, knowledge.status);
  knowledgeCategory.textContent = knowledge.category
    ? `${knowledge.category} Trivia`
    : "Trivia Round";
  knowledgeEntries.innerHTML = "";

  knowledge.entries.forEach((entry, index) => {
    const item = document.createElement("div");
    item.className = `knowledge-item${entry.active ? " active" : ""}`;

    const clue = document.createElement("p");
    clue.className = "knowledge-clue";
    clue.textContent = `${index + 1}. ${entry.clue}`;

    const answer = document.createElement("p");
    answer.className = "knowledge-answer";
    answer.textContent = entry.solvedAnswer
      ? `Solved: ${entry.solvedAnswer}`
      : `Answer length: ${entry.answerLength}`;

    item.appendChild(clue);
    item.appendChild(answer);
    knowledgeEntries.appendChild(item);
  });

  knowledgeMeta.textContent = knowledge.currentEntry
    ? `Current entry: ${knowledge.currentEntry}`
    : `Working on clue ${knowledge.activeEntryIndex + 1}`;
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

  if (state.mode === "WORDS" && state.words) renderWords(state.words);
  if (state.mode === "NUMBERS" && state.numbers) renderNumbers(state.numbers);
  if (state.mode === "KNOWLEDGE" && state.knowledge) renderKnowledge(state.knowledge);
}

context.addCustomMessageListener(NAMESPACE, (event) => {
  try {
    const state = JSON.parse(event.data);
    setSubtitle("Live group play screen");
    renderState(state);
  } catch (error) {
    console.error("Failed to parse PuzzleStreak cast state", error);
    setSubtitle("Unable to parse game state.");
  }
});

window.addEventListener("error", (event) => {
  const details = event.message || (event.error && event.error.message) || "Unknown receiver error";
  console.error("Receiver runtime error", event.error || event.message);
  setSubtitle(`Receiver error: ${details}`);
});

context.start({
  disableIdleTimeout: true,
  customNamespaces: {
    [NAMESPACE]: cast.framework.system.MessageType.STRING,
  },
});
