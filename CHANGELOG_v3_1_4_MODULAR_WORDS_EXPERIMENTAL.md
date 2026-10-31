# CHAOSOS v3.1.4 — Modular Words (Experimental)

- Removed the duplicate legacy command loader `js/brain/commands.js`; `js/brain/words/commands.js` is the single command-dispatch module.
- Split the former mixed phrase tables into greetings, identity, AI tools, ordinary questions, relationships, locations, countries, archive terms, dark-theme vocabulary, banter, stories, jokes, links, and migrated knowledge-base phrases.
- Migrated the unused `knowledgeBase` content from `js/brain/knowledge.js` into `js/brain/words/knowledgeBase.js`; removed the obsolete global table and its script include.
- Fixed terminal and app script loading so the word registry and all phrase modules load before the legacy knowledge adapter.
- Updated the service-worker cache, project index, and Cordova `www` mirror.
- Experimental only; physical Android device testing and APK build are not claimed.
