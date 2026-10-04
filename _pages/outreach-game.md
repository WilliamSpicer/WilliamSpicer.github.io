---
layout: archive
title: "Play Glacier Top Trumps"
permalink: /outreach/game/
author_profile: true
---

[Back to Outreach]({{ '/outreach/' | relative_url }})

<section class="glacier-game" aria-labelledby="glacier-game-title" data-csv-url="{{ '/files/GreenlandCardData.csv' | relative_url }}">
  <style>
    .glacier-game { max-width: 1100px; margin: 2rem auto; color: #17324d; }
    .glacier-game h2, .glacier-game h3 { margin-top: 0; }
    .glacier-game__status { min-height: 1.5em; font-weight: 700; }
    .glacier-game__board { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; margin: 1.5rem 0; align-items: stretch; }
    .glacier-game__card { min-width: 0; border: 2px solid #d4e1e7; border-radius: 18px; padding: 1.25rem; background: #fff; box-shadow: 0 5px 16px rgba(20, 47, 62, .12); }
    .glacier-game__card h3 { margin: 0 0 .5rem; color: #17324d; }
    .glacier-game__card p { margin: .35rem 0; color: #496579; }
    .glacier-game__card ul { list-style: none; padding: 0; margin: 1rem 0 0; }
    .glacier-game__card li { margin: 0; padding: 0; border-top: 1px solid #d8e7ee; }
    .glacier-game__stat-button { box-sizing: border-box; width: 100%; display: flex; justify-content: space-between; gap: 1rem; padding: .65rem .9rem !important; border: 0; text-align: left; font: inherit; text-transform: none !important; border-radius: 0 !important; background: #f0f3f8 !important; color: #17324d !important; }
    .glacier-game__stat-button:hover:not(:disabled) { background: #e3ebf2 !important; }
    .glacier-game__stat-button:disabled { opacity: 1; background: #f0f3f8 !important; color: #17324d !important; }
    .glacier-game__stat-row.is-winner .glacier-game__stat-button { background: #d8f1df !important; color: #14532d !important; font-weight: 700; }
    .glacier-game__stat-row.is-loser .glacier-game__stat-button { background: #f8dddd !important; color: #7f1d1d !important; }
    .glacier-game__stat-row.is-tie .glacier-game__stat-button { background: #fff1c9 !important; color: #684c00 !important; }
    .glacier-game__card-back { min-height: 430px; display: grid; place-items: center; border-radius: 12px; background: repeating-linear-gradient(45deg, #eaf1f5 0 12px, #f8fbfc 12px 24px); color: #496579; font-size: 1.25rem; font-weight: 700; }
    .glacier-game [hidden] { display: none !important; }
    .glacier-game__choices { display: flex; flex-wrap: wrap; gap: .5rem; margin: 1rem 0; }
    .glacier-game button { border: 0; border-radius: 6px; padding: .65rem .9rem; background: #176b87; color: white; font: inherit; cursor: pointer; }
    .glacier-game button:hover:not(:disabled) { background: #104d63; }
    .glacier-game button:disabled { background: #9aaeb8; cursor: not-allowed; }
    .glacier-game__new { background: #40566b !important; }
    .glacier-game__note { font-size: .9em; color: #496579; }
    @media (max-width: 650px) { .glacier-game__board { grid-template-columns: 1fr; gap: 1rem; } .glacier-game__card-back { min-height: 220px; } }
    @media (prefers-reduced-motion: no-preference) { .glacier-game__card { transition: border-color .2s ease; } }
  </style>

  <h2 id="glacier-game-title">Your cards</h2>
  <p>Cards in your hand: <strong id="player-count">0</strong> &nbsp;|&nbsp; Computer: <strong id="computer-count">0</strong></p>
  <p id="game-status" class="glacier-game__status" role="status" aria-live="polite">Loading glacier cards from the CSV…</p>
  <div class="glacier-game__board" aria-live="polite">
    <article class="glacier-game__card" id="player-card"><h3>Your card</h3><p>Waiting to deal…</p></article>
    <article class="glacier-game__card" id="computer-card"><h3>Computer's card</h3><div class="glacier-game__card-back">Card face down</div></article>
  </div>
  <section class="glacier-game__result" id="round-result" aria-live="polite" hidden>
    <h3 id="result-title"></h3>
    <p id="result-detail"></p>
    <p id="result-fact-row" hidden><strong>Glacier fact:</strong> <span id="result-fact"></span></p>
    <button type="button" id="continue-round">Next turn</button>
  </section>
  <button type="button" class="glacier-game__new" id="new-game">Start game / deal again</button>
  <p class="glacier-game__note">Values and facts come from the CSV. A higher numeric value wins each category. Blank or non-numeric values are skipped for that round. If there is a tie, those cards go into a shared pile and the next round's winner takes them.</p>

</section>

<script src="{{ '/assets/js/glacier-top-trumps.js' | relative_url }}?v=7"></script>
