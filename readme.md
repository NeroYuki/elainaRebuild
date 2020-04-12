Complete rewriting for Elaina due to previous code base deemed not maintainable
### Project's goal
Creating a self-host bot that can do some cool trick upon its sleeve (game integration, ultilities, etc.)
### Game supporting
(no commands implementation yet, should be easy to add as all game integration wrapper is promise-based and should return json data on completion) <br>
- osu!droid - use private droidBancho api (need api key - get user info, fetch score) <br>
- osu! - use official osu api (need api key - get map info, download map as .osu file) <br>
- Azur Lane - use azur lane's login api (check server status for en, jp and cn-android server) <br>
- Malody - use web scrapper (get user info, get chart info) <br>
- Arcaea - use estertion score prober (get user info) <br>