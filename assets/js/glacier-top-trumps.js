    (function () {
      var categories = [
        { key: "length", label: "Length (km)" },
        { key: "speed", label: "Flow speed (m/day)" },
        { key: "height", label: "Ice-front height (m)" }
      ];
      // Replace these illustrative values with the facts from your cards.
      var glacierCards = [
        { name: "Demo Glacier A", length: 42, speed: 3.2, height: 85, fact: "Replace this with a verified fact about this glacier." },
        { name: "Demo Glacier B", length: 28, speed: 5.1, height: 62, fact: "Replace this with a verified fact about this glacier." },
        { name: "Demo Glacier C", length: 55, speed: 2.4, height: 110, fact: "Replace this with a verified fact about this glacier." },
        { name: "Demo Glacier D", length: 36, speed: 4.3, height: 74, fact: "Replace this with a verified fact about this glacier." },
        { name: "Demo Glacier E", length: 31, speed: 6.0, height: 91, fact: "Replace this with a verified fact about this glacier." },
        { name: "Demo Glacier F", length: 47, speed: 3.8, height: 68, fact: "Replace this with a verified fact about this glacier." },
        { name: "Demo Glacier G", length: 24, speed: 2.9, height: 103, fact: "Replace this with a verified fact about this glacier." },
        { name: "Demo Glacier H", length: 60, speed: 4.7, height: 79, fact: "Replace this with a verified fact about this glacier." }
      ];
      var player = [], computer = [], tiePile = [], playerLeads = true, finished = false;
      var status = document.getElementById("game-status");
      var choices = document.getElementById("category-choices");
      var resultPanel = document.getElementById("round-result");

      function showResult(title, detail, fact) {
        document.getElementById("result-title").textContent = title;
        document.getElementById("result-detail").textContent = detail;
        document.getElementById("result-fact").textContent = fact || "";
        resultPanel.hidden = false;
        choices.innerHTML = "";
      }

      function clearResult() {
        resultPanel.hidden = true;
        document.getElementById("result-title").textContent = "";
        document.getElementById("result-detail").textContent = "";
        document.getElementById("result-fact").textContent = "";
      }

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
        var winningCard = winner === "player" ? player[0] : computer[0];
        var losingCard = winner === "player" ? computer[0] : player[0];
        var playerValue = player[0][category.key];
        var computerValue = computer[0][category.key];
        var winningValue = winner === "player" ? playerValue : computerValue;
        var losingValue = winner === "player" ? computerValue : playerValue;
        var comparison = winningCard.name + " beats " + losingCard.name + " in " + category.label + ": " + winningValue + " to " + losingValue + ".";
        var playerCard = player.shift(), computerCard = computer.shift();
        var winnings = tiePile.concat([playerCard, computerCard]);
        tiePile = [];
        if (winner === "player") {
          player.push.apply(player, winnings);
          status.textContent = "You won this round!";
          showResult("You win this round!", comparison + " You collect the " + losingCard.name + " card.", winningCard.fact);
          playerLeads = true;
        } else {
          computer.push.apply(computer, winnings);
          status.textContent = "The computer won this round.";
          showResult("The computer wins this round", comparison + " It collects the " + losingCard.name + " card.", winningCard.fact);
          playerLeads = false;
        }
        updateCounts();
        if (player.length === 0 || computer.length === 0) {
          finished = true;
          status.textContent += player.length ? " You win the game!" : " The computer wins the game";
          document.getElementById("result-title").textContent = player.length ? "You win the game!" : "The computer wins the game!";
          document.getElementById("continue-round").textContent = "Game over";
          document.getElementById("continue-round").disabled = true;
          return;
        }
      }
      function chooseCategory(category) {
        if (finished || !player.length || !computer.length) return;
        var computerCategory = categories.reduce(function (best, item) {
          return computer[0][item.key] > computer[0][best.key] ? item : best;
        }, categories[0]);
        var selected = playerLeads ? category : computerCategory;
        showCards(true);
        if (!playerLeads) status.textContent = "The computer chose " + selected.label + ".";
        var playerValue = player[0][selected.key], computerValue = computer[0][selected.key];
        if (playerValue === computerValue) {
          tiePile.push(player.shift(), computer.shift());
          updateCounts();
          status.textContent = "It's a tie!";
          showResult("It's a tie!", "Both cards have " + playerValue + " for " + selected.label + ". The cards go into the shared pile; you choose next round.", "No card won this round, so there is no winning-card fact.");
          playerLeads = true;
        } else {
          finishRound(playerValue > computerValue ? "player" : "computer", selected);
        }
      }
      function nextRound() {
        if (finished) return;
        clearResult();
        document.getElementById("continue-round").textContent = "Next turn";
        document.getElementById("continue-round").disabled = false;
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
        clearResult();
        document.getElementById("continue-round").textContent = "Next turn";
        document.getElementById("continue-round").disabled = false;
        updateCounts();
        nextRound();
      }
      document.getElementById("continue-round").addEventListener("click", nextRound);
      document.getElementById("new-game").addEventListener("click", startGame);
    }());
