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
    .glacier-game [hidden] { display: none !important; }
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
  <section class="glacier-game__result" id="round-result" aria-live="polite" hidden>
    <h3 id="result-title"></h3>
    <p id="result-detail"></p>
    <p id="result-fact-row" hidden><strong>Glacier fact:</strong> <span id="result-fact"></span></p>
    <button type="button" id="continue-round">Next turn</button>
  </section>
  <h3 id="choice-heading">Choose a category</h3>
  <div class="glacier-game__choices" id="category-choices" aria-labelledby="choice-heading"></div>
  <button type="button" class="glacier-game__new" id="new-game">Start game / deal again</button>
  <p class="glacier-game__note">Demo stats and facts are placeholders, not real glacier measurements or facts. The highest number wins. If there is a tie, the cards go into a shared pile and the next round's winner takes them.</p>

</section>

<script src="{{ '/assets/js/glacier-top-trumps.js' | relative_url }}?v=4"></script>
