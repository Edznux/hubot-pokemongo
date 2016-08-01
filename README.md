:warning: **As of today (31/08), Pokevision is down for un undefined amount of time.** We will provide a replacement of their private API which we were relying on, but we do not have any timeframe.

*If you have a working/work in progress replacement proposition feel free to open an issue and discuss it.*

# hubot-pokemongo

Hubot script for pokemon go.
hubot-pokemongo send you one private message every time one pokemon spawn near you.
It support multiple location, mute notification, custom notification interval, and some small features.

:exclamation: *This does not require you to run your own bots for Pokémon localisation. However, the API we're querying is very instable and you might experience not-so-great service and unaccurate results.*

## dependency

- hubot-redis-brain
- geolib

## Commands available

- add <lat> <long> : Attach address to your user
- debug on : Enable debug
- debug off : Disable debug
- delete <lat> <long> : Delete address from your user
- list : List addresses from the current user
- locale <en|fr|de> : Set locale for the current user
- notif on : Enable notification
- notif off : Disable notification
- number <number> : Search for a Pokémon using it's Pokédex number
- nb <number> : Alias for number
- id <number> : Alias for number
- preference : Show user preferences
- range <meters> : Set detection range to <meters>m
- remove <lat> <long> : Alias for delete
- rm <address> : Alias for delete
- search <query> : Searches on a Pokémon Wiki (depending on your locale)
- s <query> : Alias for search
- timer <minutes> : Set timer interval to <minutes> minute(s)
- version : Print current version of hubot-pokemongo
- help : Print this help
- ? : Alias for help

## Examples

```
> {hubot} pogo add 43.60385011 1.4439189
> {hubot} pogo list
  43.60385011/1.4439189

> {hubot} pogo remove 43.60385011 1.4439189
> {hubot} pogo list
```

## Installation

Download the latest version from npm

```
npm install hubot-pokemongo
```
Add dependency to your hubot external script:
external-scripts.json
```
[
  //....
  "hubot-redis-brain",
  "hubot-pokemongo"
  //....
]
```


## TODO

- [x] Refactoring
- [x] Locale (User preferences)
- [ ] Tests
- [ ] Show pokemon on map (send image)
- [x] Improve range system
