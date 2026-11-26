---
layout: archive
title: "Outreach"
permalink: /outreach/
author_profile: true
---
# [Greenland Glacier Card Game]({{ '/glacier-game/' | relative_url }})


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

1. Choose a difficulty and press **Deal cards**. The cards are shuffled and split between you and the computer.
2. On your turn, pick a category on your card that you think will beat the computer's card. The computer's card is then turned over and the same category is compared on both cards.
3. The higher value wins the round. The chosen category is highlighted green on the winning card and red on the losing card, and a fun fact about the winning glacier appears. The winner takes both cards and chooses the category for the next round. Press **Next turn** when you are ready to continue.
4. When the computer chooses, how well it picks depends on the difficulty: on **Easy** it often picks at random, on **Normal** it picks its strongest category about half the time, and on **Hard** it nearly always picks its strongest category.
5. If the values tie, both cards go into a tie pile and you choose the next category. Whoever wins the next round takes the tie pile too.
6. The game ends when one player holds every card.

## Play the game

[Open Glacier Card Game]({{ '/glacier-game/' | relative_url }}) to view the cards and play against the computer.
