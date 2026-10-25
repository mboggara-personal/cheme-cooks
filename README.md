# ChemE Cooks: an Indian Food Atlas

An interactive atlas of 286 Indian dishes on a map of India, each with a recipe written for the atlas, a Nutri-Score, Ayurvedic notes, a sourced history and, for many, a chemical-engineering deep dive.

**Live site:** https://mboggara-personal.github.io/cheme-cooks/

## What's inside

- **Map, cards and trails:** dishes pinned to their places, filters by diet (veg, non-veg, fish, egg, Jain, vrat), meal, region, Nutri-Score, dosha, kitchen and festival; themed food trails.
- **Recipes:** servings scaling, cook mode with several timers, variants of each dish.
- **Meal plan:** a week planner with hands-on time budgets, a ChemE kitchen scheduler (backward list scheduling with your hands, burners and oven as constraints), shopping list and weekend prep session.
- **Pantry:** an ingredient and spice atlas (62 cards) and "what can I cook with what I have".
- **ChemE labs:** 17 interactive deep dives (fermentation, pressure cooking, syrups, frying, filtration, extraction, radiation, diffusion, freezing and more).
- **Kids lab:** 12 predict-try-explain kitchen experiments.
- **Thali builder, passport and a guess-the-origin game.**

## Build

The site is a single HTML page assembled from the source files:

```
python3 build.py
```

This writes `docs/index.html` (served by GitHub Pages) and `cheme-cooks-atlas.html`. No dependencies beyond Python 3. Progress (passport, plan, pantry) is stored in the visitor's own browser.

## Licence

Code: [MIT](LICENSE). Content: [CC BY-NC 4.0](LICENSE-CONTENT.md). Map data and libraries keep their own licences, listed in [LICENSE-CONTENT.md](LICENSE-CONTENT.md).

The map shows India's external boundaries as per the Survey of India, simplified for display and not to scale.
