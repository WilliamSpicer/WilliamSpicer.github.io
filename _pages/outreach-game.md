---
layout: game
title: "Play Greenland Glacier Card Game"
permalink: /outreach/game/
---

<main class="gg" data-csv-url="{{ '/files/GreenlandCardData.csv' | relative_url }}" data-images-url="{{ '/images/glaciers/' | relative_url }}" data-state="loading">
  <header class="gg-hud">
    <a class="gg-hud__back" href="{{ '/outreach/' | relative_url }}" aria-label="Back to Outreach">&#8592;<span> Outreach</span></a>
    <h1 class="gg-hud__title">Greenland Glacier <span>Card Game</span></h1>
    <button type="button" class="gg-hud__help" id="gg-help-open" aria-haspopup="dialog">? <span>How to play</span></button>
  </header>

  <div class="gg-table">
    <section class="gg-seat gg-seat--player" aria-label="Your card">
      <div class="gg-seat__label"><span>You</span><span class="gg-pill"><strong id="player-count">0</strong> cards</span></div>
      <div class="gg-card-slot">
        <article class="gg-card" id="player-card">
          <div class="gg-card__inner">
            <div class="gg-card__face gg-card__front" id="player-front"></div>
            <div class="gg-card__face gg-card__back" aria-hidden="true"></div>
          </div>
        </article>
      </div>
    </section>

    <section class="gg-centre" aria-label="Game status">
      <div class="gg-centre__score" aria-hidden="true">
        <span class="gg-stack gg-stack--player"><b id="player-count-big">0</b><small>You</small></span>
        <span class="gg-centre__vs">VS</span>
        <span class="gg-stack gg-stack--computer"><b id="computer-count-big">0</b><small>Computer</small></span>
      </div>
      <p class="gg-centre__pot" id="tie-pot" hidden>Tie pile: <strong id="tie-count">0</strong> cards</p>
      <div class="gg-centre__message" aria-live="polite">
        <p class="gg-centre__status" id="game-status" role="status">Shuffling the glacier cards…</p>
        <div class="gg-result" id="round-result" hidden>
          <h2 class="gg-result__title" id="result-title"></h2>
          <p class="gg-result__detail" id="result-detail"></p>
          <p class="gg-result__fact" id="result-fact-row" hidden><span class="gg-result__fact-label">Glacier fact</span> <span id="result-fact"></span></p>
        </div>
      </div>
      <fieldset class="gg-difficulty" id="gg-difficulty">
        <legend>Computer difficulty</legend>
        <div class="gg-difficulty__options">
          <label><input type="radio" name="gg-difficulty" value="easy"><span>Easy</span></label>
          <label><input type="radio" name="gg-difficulty" value="normal" checked><span>Normal</span></label>
          <label><input type="radio" name="gg-difficulty" value="hard"><span>Hard</span></label>
        </div>
      </fieldset>
      <div class="gg-centre__actions">
        <button type="button" class="gg-btn gg-btn--primary" id="continue-round" hidden>Next turn &#8594;</button>
        <button type="button" class="gg-btn gg-btn--primary" id="new-game" disabled>Deal cards</button>
      </div>
    </section>

    <section class="gg-seat gg-seat--computer" aria-label="Computer's card">
      <div class="gg-seat__label"><span>Computer</span><span class="gg-pill"><strong id="computer-count">0</strong> cards</span></div>
      <div class="gg-card-slot">
        <article class="gg-card" id="computer-card">
          <div class="gg-card__inner">
            <div class="gg-card__face gg-card__front" id="computer-front"></div>
            <div class="gg-card__face gg-card__back" aria-hidden="true"></div>
          </div>
        </article>
      </div>
    </section>
  </div>

  <dialog class="gg-dialog" id="gg-help" aria-labelledby="gg-help-title">
    <h2 id="gg-help-title">How to play</h2>
    <ol>
      <li>Press <strong>Deal cards</strong>. The glacier cards are shuffled and split between you and the computer.</li>
      <li>Choose how tough the computer is: on <strong>Easy</strong> it often picks at random, on <strong>Hard</strong> it nearly always picks its strongest stat.</li>
      <li>On your turn, pick a stat on your card that you think will beat the computer's card.</li>
      <li>The higher number wins. The winner takes both cards and picks the next stat.</li>
      <li>If it's a tie, both cards go into a tie pile, and whoever wins the next round takes them too.</li>
      <li>The game ends when one player holds every card.</li>
    </ol>
    <p class="gg-dialog__note">All values and facts come from the glacier data sheet. A stat with no data is greyed out and can't be picked for that round.</p>
    <form method="dialog"><button class="gg-btn gg-btn--primary" type="submit">Got it</button></form>
  </dialog>
</main>

<script src="{{ '/assets/js/glacier-top-trumps.js' | relative_url }}?v=12"></script>
