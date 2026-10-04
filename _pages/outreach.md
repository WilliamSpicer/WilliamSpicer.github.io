---
layout: archive
title: "Outreach"
permalink: /outreach/
author_profile: true
---

This is a first, simple test of a Greenlandic glacier Top Trumps game. Choose a stat when it is your turn; the higher value wins both cards. The sample names and numbers below are placeholders, ready to be replaced with facts from the paper cards.

<section class="glacier-game" aria-labelledby="glacier-game-title">
  <style>
    .glacier-game { max-width: 760px; margin: 2rem auto; color: #17324d; }
    .glacier-game h2, .glacier-game h3 { margin-top: 0; }
    .glacier-game__status { min-height: 1.5em; font-weight: 700; }
    .glacier-game__board { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin: 1rem 0; }
    .glacier-game__card { border: 2px solid #b7d8e8; border-radius: 12px; padding: 1rem; background: #f3f9fc; }
    .glacier-game__card h3 { margin-bottom: .25rem; }
    .glacier-game__card p { margin-top: 0; color: #496579; }
    .glacier-game__card ul { list-style: none; padding: 0; margin: .75rem 0 0; }
    .glacier-game__card li { padding: .3rem 0; border-top: 1px solid #d8e7ee; }
    .glacier-game__choices { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; }
    .glacier-game button { border: 0; border-radius: 6px; padding: .65rem .9rem; background: #176b87; color: white; font: inherit; cursor: pointer; }
    .glacier-game button:hover:not(:disabled) { background: #104d63; }
    .glacier-game button:disabled { background: #9aaeb8; cursor: not-allowed; }
    .glacier-game__new { background: #40566b !important; }
    .glacier-game__note { font-size: .9em; color: #496579; }
    @media (prefers-reduced-motion: no-preference) { .glacier-game__card { transition: border-color .2s ease; } }
  </style>

  <h2 id="glacier-game-title">Glacier Top Trumps: a first test</h2>
  <p>Cards in your hand: <strong id="player-count">0</strong> &nbsp;|&nbsp; Computer: <strong id="computer-count">0</strong></p>
  <p id="game-status" class="glacier-game__status" role="status" aria-live="polite">Press “Start game” to shuffle and deal the sample cards.</p>
  <div class="glacier-game__board" aria-live="polite">
    <article class="glacier-game__card" id="player-card"><h3>Your card</h3><p>Waiting to deal…</p></article>
    <article class="glacier-game__card" id="computer-card"><h3>Computer's card</h3><p>Waiting to deal…</p></article>
  </div>
  <h3 id="choice-heading">Choose a category</h3>
  <div class="glacier-game__choices" id="category-choices" aria-labelledby="choice-heading"></div>
  <button type="button" class="glacier-game__new" id="new-game">Start game / deal again</button>
  <p class="glacier-game__note">Demo stats are invented for this prototype and are not real glacier measurements. The highest number wins. If there is a tie, the cards go into a shared pile and the next round's winner takes them.</p>

  <script>
    (function () {
      var categories = [
        { key: "length", label: "Length (km)" },
        { key: "speed", label: "Flow speed (m/day)" },
        { key: "height", label: "Ice-front height (m)" }
      ];
      // Replace these illustrative values with the facts from your cards.
      var glacierCards = [
        { name: "Demo Glacier A", length: 42, speed: 3.2, height: 85 },
        { name: "Demo Glacier B", length: 28, speed: 5.1, height: 62 },
        { name: "Demo Glacier C", length: 55, speed: 2.4, height: 110 },
        { name: "Demo Glacier D", length: 36, speed: 4.3, height: 74 },
        { name: "Demo Glacier E", length: 31, speed: 6.0, height: 91 },
        { name: "Demo Glacier F", length: 47, speed: 3.8, height: 68 },
        { name: "Demo Glacier G", length: 24, speed: 2.9, height: 103 },
        { name: "Demo Glacier H", length: 60, speed: 4.7, height: 79 }
      ];
      var player = [], computer = [], tiePile = [], playerLeads = true, finished = false;
      var status = document.getElementById("game-status");
      var choices = document.getElementById("category-choices");

      function shuffle(cards) {
        for (var i = cards.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = cards[i]; cards[i] = cards[j]; cards[j] = temp;
        }
        return cards;
      }
      function cardMarkup(card, showValues) {
        if (!card) return "<h3>No card</h3><p>This player is out of cards.</p>";
        var list = categories.map(function (category) {
          var value = showValues ? card[category.key] : "?";
          return "<li>" + category.label + ": <strong>" + value + "</strong></li>";
        }).join("");
        return "<h3>" + card.name + "</h3><p>Sample glacier card</p><ul>" + list + "</ul>";
      }
      function updateCounts() {
        document.getElementById("player-count").textContent = player.length;
        document.getElementById("computer-count").textContent = computer.length;
      }
      function showCards(revealComputer) {
        document.getElementById("player-card").innerHTML = cardMarkup(player[0], true);
        document.getElementById("computer-card").innerHTML = cardMarkup(computer[0], revealComputer);
      }
      function finishRound(winner, category) {
        var playerCard = player.shift(), computerCard = computer.shift();
        var winnings = tiePile.concat([playerCard, computerCard]);
        tiePile = [];
        if (winner === "player") {
          player.push.apply(player, winnings);
          status.textContent = "You win this round on " + category.label + "! You collect " + winnings.length + " card(s).";
          playerLeads = true;
        } else {
          computer.push.apply(computer, winnings);
          status.textContent = "The computer wins this round on " + category.label + ". It collects " + winnings.length + " card(s).";
          playerLeads = false;
        }
        updateCounts();
        if (player.length === 0 || computer.length === 0) {
          finished = true;
          status.textContent += player.length ? " You win the game!" : " The computer wins the game.";
          choices.innerHTML = "";
          showCards(false);
          return;
        }
        window.setTimeout(nextRound, 1100);
      }
      function chooseCategory(category) {
        if (finished || !player.length || !computer.length) return;
        var computerCategory = categories.reduce(function (best, item) {
          return computer[0][item.key] > computer[0][best.key] ? item : best;
        }, categories[0]);
        var selected = playerLeads ? category : computerCategory;
        showCards(true);
        if (!playerLeads) status.textContent = "The computer chooses " + selected.label + ".";
        var playerValue = player[0][selected.key], computerValue = computer[0][selected.key];
        if (playerValue === computerValue) {
          tiePile.push(player.shift(), computer.shift());
          updateCounts();
          status.textContent += " It's a tie (" + playerValue + ")! Cards go into the shared pile; you choose next round.";
          playerLeads = true;
          window.setTimeout(nextRound, 1100);
        } else {
          finishRound(playerValue > computerValue ? "player" : "computer", selected);
        }
      }
      function nextRound() {
        if (finished) return;
        if (!player.length || !computer.length) {
          finished = true;
          status.textContent = player.length ? "You win the game!" : "The computer wins the game.";
          choices.innerHTML = "";
          return;
        }
        showCards(false);
        choices.innerHTML = "";
        if (playerLeads) {
          status.textContent = "Your turn: choose a category.";
          categories.forEach(function (category) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = category.label;
            button.addEventListener("click", function () { chooseCategory(category); });
            choices.appendChild(button);
          });
        } else {
          status.textContent = "Computer's turn to choose a category…";
          window.setTimeout(function () { chooseCategory(categories[0]); }, 900);
        }
      }
      function startGame() {
        var deck = shuffle(glacierCards.map(function (card) { return Object.assign({}, card); }));
        player = deck.slice(0, deck.length / 2);
        computer = deck.slice(deck.length / 2);
        tiePile = [];
        playerLeads = true;
        finished = false;
        updateCounts();
        nextRound();
      }
      document.getElementById("new-game").addEventListener("click", startGame);
    }());
  </script>
</section>
