(function () {
  "use strict";

  // key = CSV column header; label = full description; short/unit = what fits on the card
  var categories = [
    { key: "Frontal velocity (mean 1985–2024, m/yr)", label: "Frontal velocity (1985–2024 mean, m/yr)", short: "Velocity", unit: "m/yr" },
    { key: "Frontal Ablation 2010-2020 (Gt/yr)", label: "Frontal ablation (2010–2020, Gt/yr)", short: "Frontal ablation", unit: "Gt/yr" },
    { key: "terminus position change", label: "Terminus position change", short: "Terminus change", unit: "" },
    { key: "area km2 geodetic", label: "Geodetic area (km²)", short: "Area", unit: "km²" },
    { key: "population in area", label: "Population in the area", short: "Population", unit: "people" },
    { key: "Mass balance 2000–2017 (Gt)", label: "Mass balance (2000–2017, Gt)", short: "Mass balance", unit: "Gt" },
    { key: "number of publications", label: "Number of publications", short: "Publications", unit: "" },
    { key: "runoff (RACMO, 2015–2024, Gt)", label: "Runoff (RACMO 2015–2024, Gt)", short: "Runoff", unit: "Gt" }
  ];

  // satellite picture for each card: Glacier name in the CSV -> file in images/glaciers/
  // a glacier missing from this list gets the drawn glacier scene instead
  var glacierImages = {
    "Jakobshavn Isbræ": "jakobshavn-isbrae.jpg",
    "Kangiata Nunaata Sermia": "kangiata-nunaata-sermia.jpg",
    "Helheim Glacier": "helheim-glacier.jpg",
    "K.I.V Steenstrup Nørdre Bræ": "kiv-steenstrup-nordre-brae.jpg",
    "Store Glacier": "store-glacier.jpg",
    "Petermann Glacier": "petermann-glacier.jpg",
    "Nioghalvfjerdsbræ": "nioghalvfjerdsbrae.jpg",
    "Køge Bugt": "koge-bugt.jpg",
    "Harald Moltke Bræ": "harald-moltke-brae.jpg",
    "Polonia Glacier": "polonia-glacier.jpg",
    "Kangerlussuaq Glacier": "kangerlussuaq-glacier.jpg",
    "Daugaard-Jensen Glacier": "daugaard-jensen-glacier.jpg",
    "Qooqqup Sermia": "qooqqup-sermia.jpg",
    "Tracy Glacier": "tracy-glacier.jpg",
    "Hayes Glacier": "hayes-glacier.jpg",
    "Saqqarliup Sermia": "saqqarliup-sermia.jpg",
    "Isunnguata Sermia": "isunnguata-sermia.jpg",
    "Frederikshåb Isblink": "frederikshab-isblink.jpg",
    "Nordenskiöld Glacier": "nordenskiold-glacier.jpg"
  };

  // colour of each card's frame, picked from the glacier name so it stays the same every game
  var frameColours = ["#3fb6d3", "#2d8fbf", "#4a7fd6", "#2fa39a", "#6c8fb3", "#3a9fc0", "#5a78c8", "#2a9a86"];

  var root = document.querySelector(".gg");
  var status = document.getElementById("game-status");
  var resultPanel = document.getElementById("round-result");
  var continueButton = document.getElementById("continue-round");
  var newGameButton = document.getElementById("new-game");
  var playerCardEl = document.getElementById("player-card");
  var computerCardEl = document.getElementById("computer-card");
  var playerFront = document.getElementById("player-front");
  var computerFront = document.getElementById("computer-front");

  var glacierCards = [];
  var player = [], computer = [], tiePile = [];
  var playerLeads = true, finished = false, gameNumber = 0, roundLocked = false;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */

  function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
    });
  }

  function formatValue(value) {
    return value.toLocaleString("en-GB", { maximumFractionDigits: 2 });
  }

  function hashString(text) {
    var hash = 0;
    for (var i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    return hash;
  }

  function setState(state, outcome) {
    root.dataset.state = state;
    if (outcome) root.dataset.outcome = outcome; else delete root.dataset.outcome;
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function showResult(title, detail, fact) {
    document.getElementById("result-title").textContent = title;
    document.getElementById("result-detail").textContent = detail;
    document.getElementById("result-fact").textContent = fact || "";
    document.getElementById("result-fact-row").hidden = !fact;
    resultPanel.hidden = false;
  }

  function clearResult() {
    resultPanel.hidden = true;
    document.getElementById("result-title").textContent = "";
    document.getElementById("result-detail").textContent = "";
    document.getElementById("result-fact").textContent = "";
    document.getElementById("result-fact-row").hidden = true;
  }

  // "new": big Deal / Play again button; otherwise a small Restart button stays available
  function showButton(which) {
    continueButton.hidden = which !== "continue";
    var primary = which === "new";
    newGameButton.classList.toggle("gg-btn--primary", primary);
    newGameButton.classList.toggle("gg-btn--ghost", !primary);
    if (!primary) newGameButton.textContent = "Restart game";
  }

  /* ---------- CSV ---------- */

  function parseCSV(text) {
    var rows = [], row = [], value = "", quoted = false;
    text = text.replace(/^﻿/, "");
    for (var i = 0; i < text.length; i++) {
      var character = text[i];
      if (quoted) {
        if (character === '"' && text[i + 1] === '"') {
          value += '"'; i++;
        } else if (character === '"') {
          quoted = false;
        } else {
          value += character;
        }
      } else if (character === '"' && value === "") {
        quoted = true;
      } else if (character === ",") {
        row.push(value); value = "";
      } else if (character === "\n") {
        row.push(value); rows.push(row); row = []; value = "";
      } else if (character !== "\r") {
        value += character;
      }
    }
    if (value.length || row.length) {
      row.push(value); rows.push(row);
    }
    return rows;
  }

  function numberFromCSV(value) {
    var normalized = (value || "").trim().replace(/,/g, "");
    if (!normalized || !/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
    var parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function cleanText(value) {
    return value === "None" ? "" : (value || "");
  }

  function loadCards() {
    newGameButton.disabled = true;
    fetch(root.dataset.csvUrl)
      .then(function (response) {
        if (!response.ok) throw new Error("The CSV could not be loaded.");
        return response.text();
      })
      .then(function (text) {
        var rows = parseCSV(text);
        if (rows.length < 2) throw new Error("The CSV does not contain any glacier rows.");
        var headers = rows[0].map(function (header) { return header.trim(); });
        glacierCards = rows.slice(1).filter(function (cells) {
          return cells.some(function (cell) { return cell.trim(); });
        }).map(function (cells, index) {
          var record = {};
          headers.forEach(function (header, column) { record[header] = (cells[column] || "").trim(); });
          var card = {
            number: index + 1,
            name: record.Glacier || "Unnamed glacier",
            greenlandicName: cleanText(record["Greenlandic Name"]),
            nameMeaning: cleanText(record["Greenlandic Name meaning"]),
            fact: cleanText(record["Fun Fact"])
          };
          categories.forEach(function (category) { card[category.key] = numberFromCSV(record[category.key]); });
          return card;
        });
        if (glacierCards.length < 2) throw new Error("At least two glacier cards are needed to play.");
        newGameButton.disabled = false;
        setState("ready");
        setStatus(glacierCards.length + " glacier cards ready. Deal to start!");
        newGameButton.focus({ preventScroll: true });
      })
      .catch(function (error) {
        setStatus("The glacier cards could not be loaded. Check that files/GreenlandCardData.csv is on the site, then refresh. " + error.message);
      });
  }

  /* ---------- card art: a small glacier scene, varied per card ---------- */

  var skies = [
    { top: "#7cc4e4", bottom: "#e3f4fa", sea: "#1f5f7a", sun: "#fff6d6" },         // clear day
    { top: "#f3a77b", bottom: "#fde3c4", sea: "#36506b", sun: "#ffe3a3" },         // midnight sun
    { top: "#9db4c8", bottom: "#e6edf2", sea: "#3c5a6e", sun: "rgba(255,255,255,0)" }, // overcast
    { top: "#0d2740", bottom: "#2c5a73", sea: "#0a1e2c", sun: "rgba(255,255,255,0)", aurora: true } // polar night
  ];

  function artMarkup(card) {
    var image = glacierImages[card.name.normalize("NFC")];
    if (image) {
      return "<img src='" + escapeHTML(root.dataset.imagesUrl + image) + "' alt='Satellite image of " +
        escapeHTML(card.name) + "' loading='lazy' decoding='async'>";
    }
    var h = hashString(card.name);
    var sky = skies[h % skies.length];
    var id = "g" + h.toString(36);
    var peak1 = 18 + (h % 14), peak2 = 10 + ((h >> 4) % 16), peak3 = 22 + ((h >> 8) % 12);
    var px1 = 18 + ((h >> 3) % 14), px2 = 48 + ((h >> 6) % 14), px3 = 78 + ((h >> 9) % 12);
    var front = 64 + ((h >> 5) % 8);
    var sunX = 20 + ((h >> 2) % 60);
    var aurora = sky.aurora
      ? "<path d='M0 22 C25 8 45 30 70 14 S100 10 100 10 L100 30 C75 36 50 20 25 38 S0 34 0 34Z' fill='url(#" + id + "a)' opacity='.75'/>"
      : "";
    return "<svg viewBox='0 0 100 100' preserveAspectRatio='xMidYMid slice' aria-hidden='true' focusable='false'>" +
      "<defs>" +
        "<linearGradient id='" + id + "s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + sky.top + "'/><stop offset='1' stop-color='" + sky.bottom + "'/></linearGradient>" +
        "<linearGradient id='" + id + "i' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#ffffff'/><stop offset='1' stop-color='#bfe3ee'/></linearGradient>" +
        "<linearGradient id='" + id + "a' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#4fffb0' stop-opacity='0'/><stop offset='.5' stop-color='#4fffb0'/><stop offset='1' stop-color='#7a6cff' stop-opacity='.2'/></linearGradient>" +
      "</defs>" +
      "<rect width='100' height='100' fill='url(#" + id + "s)'/>" +
      aurora +
      "<circle cx='" + sunX + "' cy='20' r='7' fill='" + sky.sun + "'/>" +
      "<path d='M-5 " + front + " L" + px1 + " " + peak1 + " L" + (px1 + 14) + " " + (peak1 + 14) + " L" + px2 + " " + peak2 + " L" + (px2 + 12) + " " + (peak2 + 16) + " L" + px3 + " " + peak3 + " L105 " + front + "Z' fill='#5d7383'/>" +
      "<path d='M" + (px1 - 6) + " " + (peak1 + 10) + " L" + px1 + " " + peak1 + " L" + (px1 + 7) + " " + (peak1 + 8) + "Z M" + (px2 - 7) + " " + (peak2 + 11) + " L" + px2 + " " + peak2 + " L" + (px2 + 6) + " " + (peak2 + 9) + "Z M" + (px3 - 6) + " " + (peak3 + 9) + " L" + px3 + " " + peak3 + " L" + (px3 + 7) + " " + (peak3 + 10) + "Z' fill='#f4fbfd'/>" +
      "<path d='M-5 " + (front - 4) + " C20 " + (front - 16) + " 40 " + (front - 10) + " 55 " + (front - 16) + " S90 " + (front - 12) + " 105 " + (front - 6) + " L105 " + (front + 2) + " L-5 " + (front + 2) + "Z' fill='url(#" + id + "i)'/>" +
      "<path d='M-5 " + front + " L105 " + front + " L105 " + (front + 5) + " L-5 " + (front + 5) + "Z' fill='#8fcbe0'/>" +
      "<path d='M-5 " + (front + 5) + " L105 " + (front + 5) + " L105 105 L-5 105Z' fill='" + sky.sea + "'/>" +
      "<path d='M12 " + (front + 12) + " l6 -3 l5 3Z M64 " + (front + 18) + " l8 -4 l6 4Z M40 " + (front + 24) + " l4 -2 l4 2Z' fill='#eaf6fa' opacity='.9'/>" +
    "</svg>";
  }

  /* ---------- card rendering ---------- */

  function cardMarkup(card, isPlayerCard, selectedKey, winner, canChoose) {
    if (!card) {
      return "<div class='gg-card__panel'><div class='gg-card__empty'>Out of cards</div></div>";
    }
    var stats = categories.map(function (category, index) {
      var value = card[category.key];
      var valueHTML = value === null
        ? "<span class='gg-stat__value is-missing'>n/a</span>"
        : "<span class='gg-stat__value'>" + escapeHTML(formatValue(value)) + "</span>";
      var unit = category.unit ? "<span class='gg-stat__unit'>" + escapeHTML(category.unit) + "</span>" : "";
      var inner = "<span class='gg-stat__label'>" + escapeHTML(category.short) + unit + "</span>" + valueHTML;

      var rowClass = "gg-stat";
      if (category.key === selectedKey) {
        if (winner === "tie") rowClass += " is-tie";
        else if ((isPlayerCard && winner === "player") || (!isPlayerCard && winner === "computer")) rowClass += " is-winner";
        else rowClass += " is-loser";
      }

      var content;
      if (canChoose) {
        var unavailable = value === null || computer[0][category.key] === null;
        content = "<button type='button' class='gg-stat__btn' data-category-index='" + index + "'" +
          " title='" + escapeHTML(category.label) + (unavailable ? " – no data to compare this round" : "") + "'" +
          (unavailable ? " disabled" : "") + ">" + inner + "</button>";
      } else {
        content = "<div class='gg-stat__btn' title='" + escapeHTML(category.label) + "'>" + inner + "</div>";
      }
      return "<li class='" + rowClass + "'>" + content + "</li>";
    }).join("");

    var local = card.greenlandicName && card.greenlandicName !== card.name
      ? "<p class='gg-card__local'>" + escapeHTML(card.greenlandicName) + "</p>" : "";
    var meaning = card.nameMeaning
      ? "<p class='gg-card__meaning' title='" + escapeHTML(card.nameMeaning) + "'>" + escapeHTML(card.nameMeaning) + "</p>" : "";

    return "<div class='gg-card__panel'>" +
      "<div class='gg-card__head'><div><h2 class='gg-card__name'>" + escapeHTML(card.name) + "</h2>" + local + "</div>" +
      "<span class='gg-card__number' aria-label='Card " + card.number + "'>#" + card.number + "</span></div>" +
      "<div class='gg-card__art'>" + artMarkup(card) + "</div>" +
      meaning +
      "<ul class='gg-card__stats' aria-label='" + (canChoose ? "Choose a stat" : "Stats") + "'>" + stats + "</ul>" +
    "</div>";
  }

  function paintFront(front, card) {
    var colour = card ? frameColours[hashString(card.name) % frameColours.length] : "#8aa0ab";
    front.style.setProperty("--frame", colour);
  }

  function deal(cardEl) {
    if (reduceMotion) return;
    cardEl.classList.remove("is-dealt");
    void cardEl.offsetWidth; // restart the animation
    cardEl.classList.add("is-dealt");
  }

  function clearOutcomeClasses() {
    [playerCardEl, computerCardEl].forEach(function (el) {
      el.classList.remove("is-round-winner", "is-round-loser");
    });
  }

  // revealComputer: flip the computer card face up
  function showCards(revealComputer, selectedKey, winner) {
    var canChoose = !revealComputer && playerLeads && !finished && player.length > 0 && computer.length > 0;

    playerCardEl.classList.remove("is-face-down");
    paintFront(playerFront, player[0]);
    playerFront.innerHTML = cardMarkup(player[0], true, selectedKey, winner, canChoose);

    if (revealComputer) {
      paintFront(computerFront, computer[0]);
      computerFront.innerHTML = cardMarkup(computer[0], false, selectedKey, winner, false);
      computerFront.removeAttribute("aria-hidden");
      computerCardEl.classList.remove("is-face-down");
    } else {
      computerCardEl.classList.add("is-face-down");
      computerFront.setAttribute("aria-hidden", "true");
      // keep the old face until the flip finishes so it doesn't change mid-turn
      window.setTimeout(function () {
        if (computerCardEl.classList.contains("is-face-down")) computerFront.innerHTML = "";
      }, reduceMotion ? 0 : 650);
    }

    if (canChoose) {
      playerFront.querySelectorAll("[data-category-index]").forEach(function (button) {
        button.addEventListener("click", function () {
          chooseCategory(categories[Number(button.getAttribute("data-category-index"))]);
        });
      });
    }
  }

  function updateCounts() {
    document.getElementById("player-count").textContent = player.length;
    document.getElementById("computer-count").textContent = computer.length;
    document.getElementById("player-count-big").textContent = player.length;
    document.getElementById("computer-count-big").textContent = computer.length;
    document.getElementById("tie-count").textContent = tiePile.length;
    document.getElementById("tie-pot").hidden = tiePile.length === 0;
  }

  /* ---------- rounds ---------- */

  function endGameIfOver() {
    if (player.length && computer.length) return false;
    finished = true;
    var playerWon = player.length > 0;
    setState("game-over", playerWon ? "player" : "computer");
    document.getElementById("result-title").textContent = playerWon ? "You win the game!" : "The computer wins the game!";
    setStatus(playerWon ? "You collected every glacier card." : "The computer collected every glacier card.");
    newGameButton.textContent = "Play again";
    showButton("new");
    newGameButton.focus({ preventScroll: true });
    return true;
  }

  function finishRound(winner, category) {
    var winningCard = winner === "player" ? player[0] : computer[0];
    var losingCard = winner === "player" ? computer[0] : player[0];
    var playerValue = player[0][category.key];
    var computerValue = computer[0][category.key];
    var winningValue = winner === "player" ? playerValue : computerValue;
    var losingValue = winner === "player" ? computerValue : playerValue;
    var comparison = winningCard.name + " beats " + losingCard.name + " on " + category.label + ": " +
      formatValue(winningValue) + " vs " + formatValue(losingValue) + ".";

    showCards(true, category.key, winner);
    (winner === "player" ? playerCardEl : computerCardEl).classList.add("is-round-winner");
    (winner === "player" ? computerCardEl : playerCardEl).classList.add("is-round-loser");

    var playerCard = player.shift(), computerCard = computer.shift();
    var winnings = tiePile.concat([playerCard, computerCard]);
    var bonus = tiePile.length ? " plus " + tiePile.length + " cards from the tie pile" : "";
    tiePile = [];

    if (winner === "player") {
      player.push.apply(player, winnings);
      setState("round-over", "player");
      setStatus("You chose " + category.short + ".");
      showResult("You win the round!", comparison + " You take the " + losingCard.name + " card" + bonus + ".", winningCard.fact);
      playerLeads = true;
    } else {
      computer.push.apply(computer, winnings);
      setState("round-over", "computer");
      setStatus((playerLeads ? "You chose " : "The computer chose ") + category.short + ".");
      showResult("Computer wins the round", comparison + " The computer takes your " + losingCard.name + " card" + bonus + ".", winningCard.fact);
      playerLeads = false;
    }
    updateCounts();
    if (!endGameIfOver()) {
      showButton("continue");
      continueButton.focus({ preventScroll: true });
    }
  }

  // How strong is this card's value compared with the whole deck? Returns 0 (weakest) to 1 (strongest).
  // Comparing ranks, not raw numbers, stops big-number stats like area always looking "best".
  function deckStrength(card, category) {
    var value = card[category.key], beaten = 0, others = 0;
    glacierCards.forEach(function (other) {
      var otherValue = other[category.key];
      if (other.name === card.name || otherValue === null) return;
      others++;
      if (value > otherValue) beaten++;
      else if (value === otherValue) beaten += 0.5;
    });
    return others ? beaten / others : 0.5;
  }

  // How often (0 to 1) the computer plays its strongest stat; otherwise it picks a random one.
  // Win rate when the computer chooses, from simulating every card against every other card:
  // 1 = ~91%, 0.7 = ~78%, 0.5 = ~70%, 0.3 = ~62%, 0.2 = ~58%, 0 = ~50% (purely random).
  var DIFFICULTY_SKILL = { easy: 0.2, normal: 0.5, hard: 1 };
  var COMPUTER_SKILL = DIFFICULTY_SKILL.normal;

  // Difficulty picker: remembered in this browser, and can be changed between games.
  var difficultyInputs = document.querySelectorAll("input[name='gg-difficulty']");
  function setDifficulty(level) {
    if (!DIFFICULTY_SKILL.hasOwnProperty(level)) level = "normal";
    COMPUTER_SKILL = DIFFICULTY_SKILL[level];
    difficultyInputs.forEach(function (input) { input.checked = input.value === level; });
    try { localStorage.setItem("gg-difficulty", level); } catch (error) { /* storage unavailable: just don't remember */ }
  }
  difficultyInputs.forEach(function (input) {
    input.addEventListener("change", function () { if (input.checked) setDifficulty(input.value); });
  });
  try { setDifficulty(localStorage.getItem("gg-difficulty") || "normal"); } catch (error) { setDifficulty("normal"); }

  // The computer picks the stat where its card is strongest relative to the deck
  // (like a person who knows roughly what's high or low for each stat). Ties are broken at random.
  function pickComputerCategory(card, availableCategories) {
    if (Math.random() >= COMPUTER_SKILL) {
      return availableCategories[Math.floor(Math.random() * availableCategories.length)];
    }
    var best = [], bestScore = -1;
    availableCategories.forEach(function (category) {
      var score = deckStrength(card, category);
      if (score > bestScore + 1e-9) { best = [category]; bestScore = score; }
      else if (Math.abs(score - bestScore) <= 1e-9) best.push(category);
    });
    return best[Math.floor(Math.random() * best.length)];
  }

  function chooseCategory(category) {
    if (finished || roundLocked || !player.length || !computer.length) return;
    roundLocked = true;

    var availableCategories = categories.filter(function (item) {
      return player[0][item.key] !== null && computer[0][item.key] !== null;
    });
    if (!availableCategories.length) {
      // nothing to compare: both cards go to the tie pile so the game can move on
      showCards(true);
      tiePile.push(player.shift(), computer.shift());
      updateCounts();
      setState("round-over", "tie");
      setStatus("These two glaciers have no stats in common.");
      showResult("No contest", "Both cards go into the tie pile. The winner of the next round takes them.", "");
      if (!endGameIfOver()) { showButton("continue"); continueButton.focus({ preventScroll: true }); }
      return;
    }

    var computerCategory = pickComputerCategory(computer[0], availableCategories);
    var selected = playerLeads ? category : computerCategory;
    var playerValue = player[0][selected.key], computerValue = computer[0][selected.key];

    if (playerValue === computerValue) {
      showCards(true, selected.key, "tie");
      tiePile.push(player.shift(), computer.shift());
      updateCounts();
      setState("round-over", "tie");
      setStatus((playerLeads ? "You chose " : "The computer chose ") + selected.short + ".");
      showResult("It's a tie!", "Both cards have " + formatValue(playerValue) + " for " + selected.label + ". They go into the tie pile, and you choose next.", "");
      playerLeads = true;
      if (!endGameIfOver()) { showButton("continue"); continueButton.focus({ preventScroll: true }); }
    } else {
      finishRound(playerValue > computerValue ? "player" : "computer", selected);
    }
  }

  function nextRound() {
    if (finished) return;
    clearResult();
    clearOutcomeClasses();
    roundLocked = false;
    if (endGameIfOver()) return;

    showButton("none");
    showCards(false);
    deal(playerCardEl);

    if (playerLeads) {
      setState("player-turn");
      setStatus("Your turn: tap a stat on your card.");
      var firstStat = playerFront.querySelector("button.gg-stat__btn:not(:disabled)");
      if (firstStat) firstStat.focus({ preventScroll: true });
    } else {
      setState("computer-turn");
      setStatus("The computer is choosing a stat…");
      var currentGame = gameNumber;
      window.setTimeout(function () {
        if (currentGame === gameNumber && !finished && !playerLeads) chooseCategory(categories[0]);
      }, 1300);
    }
  }

  function startGame() {
    gameNumber++;
    var deck = shuffle(glacierCards.map(function (card) { return Object.assign({}, card); }));
    var half = Math.ceil(deck.length / 2);
    player = deck.slice(0, half);
    computer = deck.slice(half);
    tiePile = [];
    playerLeads = true;
    finished = false;
    newGameButton.textContent = "Deal cards";
    updateCounts();
    deal(computerCardEl);
    nextRound();
  }

  function shuffle(cards) {
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cards[i]; cards[i] = cards[j]; cards[j] = temp;
    }
    return cards;
  }

  /* ---------- rules dialog ---------- */

  var helpDialog = document.getElementById("gg-help");
  document.getElementById("gg-help-open").addEventListener("click", function () {
    if (helpDialog.showModal) helpDialog.showModal(); else helpDialog.setAttribute("open", "");
  });

  /* ---------- start ---------- */

  // both cards start face down on the table
  playerCardEl.classList.add("is-face-down");
  computerCardEl.classList.add("is-face-down");
  showButton("new");
  continueButton.addEventListener("click", nextRound);
  newGameButton.addEventListener("click", startGame);
  loadCards();
}());
