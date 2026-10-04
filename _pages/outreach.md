---
layout: archive
title: "Outreach"
permalink: /outreach/
author_profile: true
---
# [Greenland Glacier Card Game]({{ '/outreach/game/' | relative_url }})


## About the project

I am developing a simple online card game to help players discover facts about glaciers in Greenland. These cards began as a physical paper version developed in a small group during the GRISO 2026 Summer School in Nuuk, Greenland. The browser game is an early digital prototype using the same idea of comparing glacier values.

## About the cards

Each card includes the Greenlandic name and meaning, a fun fact, and various numerical information. The current set of cards uses data from the [Greenland glacier card CSV]({{ '/files/GreenlandCardData.csv' | relative_url }}).

The game includes these comparison categories:

- Frontal velocity (mean, 1985–2024)
- Frontal ablation (2010–2020)
- Terminus position change
- Geodetic area
- Population in the area
- Mass balance (2000–2017)
- Number of publications
- Runoff (RACMO, 2015–2024)

The units and full date ranges are shown on the cards. Some glaciers do not have a numeric value for every category, so a category is unavailable for a round if either card is missing that value.

## How to play

1. Start a game. The cards are shuffled and dealt between you and the computer.
2. When it is your turn to choose, select a category on your card. The computer's card is revealed and the same category is compared on both cards.
3. The higher value wins the round. The winning category row is highlighted green, and the losing category row red. The winner takes both cards and chooses the category for the next round. When it is the computer's turn to choose, it selects its highest available value (TODO: improved selection criteria).
4. If the values tie, both cards are held for the next round. You choose the next category, and the next round's winner also collects the tied cards.
5. The game ends when one player has all the cards. A fun fact about the winning glacier appears with the round's result; press **Next turn** when you are ready to continue.

## Play the game

[Open Glacier Card Game]({{ '/outreach/game/' | relative_url }}) to view the cards and play against the computer.
