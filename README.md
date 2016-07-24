# hubot-pokemongo

Hubot script for pokemon go.
hubot-pokemongo send you one private message every time one pokemon spawn near you.
It support multiple location, mute notification, custom notification interval.

## dependency

- hubot-redis-brain

## Commands available

- add <lat> <long> : Attach address to your user
- delete <lat> <long> : Delete address from your user
- remove <lat> <long> : Alias for delete
- rm <address> : Alias for delete
- list : list addresses from the current user
- range <meters> : set detection range to <meters>m
- debug on : enable debug
- debug off : disable debug
- notif on : enable notification
- notif off : disable notification
- timer <minutes> : set timer interval to <minutes> minute(s)
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
- [ ] Locale (User preferences)
- [ ] Tests
- [ ] Show pokemon on map (send image)
- [ ] Improve range system