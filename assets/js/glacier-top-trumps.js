    (function () {
      var categories = [
        { key: "Frontal velocity (mean 1985–2024, m/yr)", label: "Frontal velocity (1985–2024 mean, m/yr)" },
        { key: "Frontal Ablation 2010-2020 (Gt/yr)", label: "Frontal ablation (2010–2020, Gt/yr)" },
        { key: "terminus position change", label: "Terminus position change" },
        { key: "area km2 geodetic", label: "Geodetic area (km²)" },
        { key: "population in area", label: "Population in the area" },
        { key: "Mass balance 2000–2017 (Gt)", label: "Mass balance (2000–2017, Gt)" },
        { key: "number of publications", label: "Number of publications" },
        { key: "runoff (RACMO, 2015–2024, Gt)", label: "Runoff (RACMO 2015–2024, Gt)" }
      ];
      var glacierCards = [];
      var player = [], computer = [], tiePile = [], playerLeads = true, finished = false, gameNumber = 0;
      var status = document.getElementById("game-status");
      var resultPanel = document.getElementById("round-result");

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

      function parseCSV(text) {
        var rows = [], row = [], value = "", quoted = false;
        text = text.replace(/^\uFEFF/, "");
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
      function loadCards() {
        var game = document.querySelector(".glacier-game");
        var startButton = document.getElementById("new-game");
        startButton.disabled = true;
        fetch(game.dataset.csvUrl)
          .then(function (response) {
            if (!response.ok) throw new Error("The CSV could not be loaded.");
            return response.text();
          })
          .then(function (text) {
            var rows = parseCSV(text);
            if (rows.length < 2) throw new Error("The CSV does not contain any glacier rows.");
            var headers = rows[0].map(function (header) { return header.trim(); });
            glacierCards = rows.slice(1).filter(function (cells) { return cells.some(function (cell) { return cell.trim(); }); }).map(function (cells) {
              var record = {};
              headers.forEach(function (header, index) { record[header] = (cells[index] || "").trim(); });
              var card = {
                name: record.Glacier || "Unnamed glacier",
                greenlandicName: record["Greenlandic Name"] === "None" ? "" : (record["Greenlandic Name"] || ""),
                nameMeaning: record["Greenlandic Name meaning"] === "None" ? "" : (record["Greenlandic Name meaning"] || ""),
                fact: record["Fun Fact"] === "None" ? "" : (record["Fun Fact"] || "")
              };
              categories.forEach(function (category) { card[category.key] = numberFromCSV(record[category.key]); });
              return card;
            });
            if (glacierCards.length < 2) throw new Error("At least two glacier cards are needed to play.");
            startButton.disabled = false;
            status.textContent = glacierCards.length + " glacier cards available. Press “Start game” to deal.";
          })
          .catch(function (error) {
            status.textContent = "The glacier CSV could not be loaded. Check that files/GreenlandCardData.csv is available on the site, then refresh. " + error.message;
          });
      }

      function shuffle(cards) {
        for (var i = cards.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = cards[i]; cards[i] = cards[j]; cards[j] = temp;
        }
        return cards;
      }
      function cardMarkup(card, showValues, isPlayerCard, selectedCategoryKey, winner) {
        if (!card) return "<h3>No card</h3><p>This player is out of cards.</p>";
        if (!isPlayerCard && !showValues) return "<h3>Computer's card</h3><div class=\"glacier-game__card-back\">Card face down</div>";
        function escapeHTML(text) {
          return String(text).replace(/[&<>"']/g, function (character) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
          });
        }
        var list = categories.map(function (category, index) {
          var value = card[category.key];
          value = showValues ? (value === null ? "Not available" : value.toLocaleString("en-GB", { maximumFractionDigits: 2 })) : "?";
          var rowClass = "glacier-game__stat-row";
          if (category.key === selectedCategoryKey) {
            if (winner === "tie") rowClass += " is-tie";
            else if ((isPlayerCard && winner === "player") || (!isPlayerCard && winner === "computer")) rowClass += " is-winner";
            else rowClass += " is-loser";
          }
          var canChoose = isPlayerCard && playerLeads && !selectedCategoryKey;
          var valueText = value === "Not available" ? value : "<strong>" + value + "</strong>";
          var rowContent = "<span>" + escapeHTML(category.label) + "</span>" + valueText;
          var content = canChoose
            ? "<button type=\"button\" class=\"glacier-game__stat-button\" data-category-index=\"" + index + "\"" + (player[0][category.key] === null || computer[0][category.key] === null ? " disabled" : "") + ">" + rowContent + "</button>"
            : "<div class=\"glacier-game__stat-button\">" + rowContent + "</div>";
          return "<li class=\"" + rowClass + "\">" + content + "</li>";
        }).join("");
        var localName = card.greenlandicName ? "<p><strong>Greenlandic name:</strong> " + escapeHTML(card.greenlandicName) + "</p>" : "";
        var meaning = card.nameMeaning ? "<p><strong>Name meaning:</strong> " + escapeHTML(card.nameMeaning) + "</p>" : "";
        var sideTitle = isPlayerCard ? "Your card" : "Computer's card";
        return "<h3>" + sideTitle + "</h3><h4>" + escapeHTML(card.name) + "</h4>" + localName + meaning + "<ul>" + list + "</ul>";
      }
      function updateCounts() {
        document.getElementById("player-count").textContent = player.length;
        document.getElementById("computer-count").textContent = computer.length;
      }
      function showCards(revealComputer, selectedCategoryKey, winner) {
        document.getElementById("player-card").innerHTML = cardMarkup(player[0], true, true, selectedCategoryKey, winner);
        document.getElementById("computer-card").innerHTML = cardMarkup(computer[0], revealComputer, false, selectedCategoryKey, winner);
        if (!revealComputer && playerLeads && player.length && computer.length) {
          document.querySelectorAll("#player-card [data-category-index]").forEach(function (button) {
            button.addEventListener("click", function () {
              chooseCategory(categories[Number(button.getAttribute("data-category-index"))]);
            });
          });
        }
      }
      function finishRound(winner, category) {
        var winningCard = winner === "player" ? player[0] : computer[0];
        var losingCard = winner === "player" ? computer[0] : player[0];
        var playerValue = player[0][category.key];
        var computerValue = computer[0][category.key];
        var winningValue = winner === "player" ? playerValue : computerValue;
        var losingValue = winner === "player" ? computerValue : playerValue;
        var comparison = winningCard.name + " beats " + losingCard.name + " in " + category.label + ": " + winningValue + " to " + losingValue + ".";
        showCards(true, category.key, winner);
        var playerCard = player.shift(), computerCard = computer.shift();
        var winnings = tiePile.concat([playerCard, computerCard]);
        tiePile = [];
        if (winner === "player") {
          player.push.apply(player, winnings);
          status.textContent = "You won this round!";
          showResult("You win this round!", comparison + " You win the " + losingCard.name + " card.", winningCard.fact);
          playerLeads = true;
        } else {
          computer.push.apply(computer, winnings);
          status.textContent = "The computer won this round.";
          showResult("The computer wins this round: " + category.label + ". ", comparison + " The computer wins your " + losingCard.name + " card.", winningCard.fact);
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
        var availableCategories = categories.filter(function (item) {
          return player[0][item.key] !== null && computer[0][item.key] !== null;
        });
        if (!availableCategories.length) {
          status.textContent = "No shared numeric category is available for these cards. Press “Next turn” to continue.";
          showResult("No comparable value", "These two glaciers have no numeric values in common.", "");
          return;
        }
        var computerCategory = availableCategories.reduce(function (best, item) {
          return computer[0][item.key] > computer[0][best.key] ? item : best;
        }, availableCategories[0]);
        var selected = playerLeads ? category : computerCategory;
        if (!playerLeads) status.textContent = "The computer chose " + selected.label + ".";
        var playerValue = player[0][selected.key], computerValue = computer[0][selected.key];
        if (playerValue === computerValue) {
          showCards(true, selected.key, "tie");
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
          return;
        }
        showCards(false);
        if (playerLeads) {
          status.textContent = "Your turn: choose a category.";
        } else {
          status.textContent = "Computer's turn to choose a category…";
          var currentGame = gameNumber;
          window.setTimeout(function () {
            if (currentGame === gameNumber && !finished && !playerLeads) chooseCategory(categories[0]);
          }, 900);
        }
      }
      function startGame() {
        gameNumber++;
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
      loadCards();
    }());
