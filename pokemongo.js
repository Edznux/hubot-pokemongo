// Description:
//   Allows hubot query ethereum blockchain and few ethereum api
//
// Dependencies:
//   hubot-brain-redis
//
// Configuration:
//   none
//
// Commands:
//   pogo add <lat> <long> : Attach address to your user",
//   pogo debug on : Enable debug",
//   pogo debug off : Disable debug",
//   pogo delete <lat> <long> : Delete address from your user",
//   pogo list : List addresses from the current user",
//   pogo locale <en|fr|de> : Set locale for the current user",
//   pogo notif on : Enable notification",
//   pogo notif off : Disable notification",
//   pogo number <number> : Search for a Pokémon using it's Pokédex number",
//   pogo nb <number> : Alias for number",
//   pogo id <number> : Alias for number",
//   pogo preference : Show user preferences",
//   pogo range <meters> : Set detection range to <meters>m",
//   pogo remove <lat> <long> : Alias for delete",
//   pogo rm <address> : Alias for delete",
//   pogo search <query> : Searches on a Pokémon Wiki (depending on your locale)",
//   pogo s <query> : Alias for search",
//   pogo timer <minutes> : Set timer interval to <minutes> minute(s)",
//   pogo version : Print current version of hubot-pokemongo",
//   pogo help : Print this help",
//   pogo ? : Alias for help"
//
// Author:
//   Edouard SCHWEISGUTH <edznux@gmail.com> (https://edouard.schweisguth.fr)
//

var https = require("https");
var DEFAULT_INTERVAL = 60*1*1000; // 1 min interval in ms

function main(robot){

	var hu = require("./lib/hubot_utils.js");
	hu.setRobot(robot);
	var pu = require("./lib/pogo_utils.js");
	pu.setRobot(robot);
	
	// pu.alertNearby();

	setInterval(function(){
		pu.alertNearby();
		//scan addr evry minutes
		pu.newScan();
	}, DEFAULT_INTERVAL)


	robot.hear(/(?:pogo)( .*)?/i, function(res){
		if(res.message.rawText.match(/^(?:pogo)/i)){

			res.match[1] = res.match[1].trim();
			switch(true){
				case /add/.test(res.match[1]):
					_addAddr(res);
					break;
				case /preferences?\b/.test(res.match[1]):
					_showPreferencesByUser(res);
					break;
				case /locales?\b/.test(res.match[1]):
					_setLocaleToUser(res);
					break;
				case /range/.test(res.match[1]):
					_addRangeToUser(res);
					break;
				case /notif on/.test(res.match[1]):
					_enableNotifToUser(res);
					break;
				case /notif off/.test(res.match[1]):
					_disableNotifToUser(res);
					break;
				case /debug on/.test(res.match[1]):
					_enableDebugToUser(res);
					break;
				case /debug off/.test(res.match[1]):
					_disableDebugToUser(res);
					break;
				case /id/.test(res.match[1]):
					_getPokemonById(res);
					break;
				case /nb/.test(res.match[1]):
					_getPokemonById(res);
					break;
				case /number/.test(res.match[1]):
					_getPokemonById(res);
					break;
				case /timer/.test(res.match[1]):
					_setTimerToUser(res);
					break;
				case /(rm)|(delete)|(remove)/.test(res.match[1]):
					_deleteAddr(res);
					break;
				case /(search)|(s)/.test(res.match[1]):
					_searchOnPokemonWiki(res);
					break;
				case res.match[1] == "list":
					_getList(res);
					break;
				case res.match[1] == "version":
						res.send(require("./package.json").version);
					break;
				case res.match[1] == "forceupdate":
						pu.alertNearby();
					break;
				case res.match[1] == "?":
				case res.match[1] == "help":
					res.send(getHelp());
					break;
				default:
					res.send(getHelp());
					break;
			}
		}
	});

	function getHelp(){
		return [
			"pogo commands",
				" - add <lat> <long> : Attach address to your user",
				" - debug on : Enable debug",
				" - debug off : Disable debug",
				" - delete <lat> <long> : Delete address from your user",
				" - list : List addresses from the current user",
				" - locale <en|fr|de> : Set locale for the current user",
				" - notif on : Enable notification",
				" - notif off : Disable notification",
				" - number <number>  : Search for a Pokémon using it's Pokédex number",
				" - nb <number> : Alias for number",
				" - id <number>  : Alias for number",
				" - preference : Show user preferences",
				" - range <meters> : Set detection range to <meters>m",
				" - remove <lat> <long> : Alias for delete",
				" - rm <address> : Alias for delete",
				" - search <query> : Searches on a Pokémon Wiki (depending on your locale)",
				" - s <query> : Alias for search"
				" - timer <minutes> : Set timer interval to <minutes> minute(s)",
				" - version : Print current version of hubot-pokemongo",
				" - help : Print this help",
				" - ? : Alias for help"
				].join("\n\t");
	}


	function _getList(res){
		var user = res.message.user.name.toLowerCase();
		var tmp = "";

		hu.listAddrFromUser(user, function(err, data){
			if(err){
				res.send(err);
			}else{
				for(var i =0; i<data.length; i++){
					tmp += data[i]+"\n";
				}
				res.send(tmp);
			}
		});
	}

	function _deleteAddr(res){
		var user = res.message.user.name.toLowerCase();
		var tmp = res.match[1].split(" ");

		console.log("remove address :", tmp[1],"/",tmp[2], "from user :", user,"[",new Date(), "]");

		if(tmp.length < 2){
			res.send("Syntax error");
			return;
		}
		hu.deleteAddrToUser(tmp[1], tmp[2], user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}

	function _addAddr(res){
		var user = res.message.user.name.toLowerCase();
		var tmp = res.match[1].split(" ");
		var lat = tmp[1];
		var long = tmp[2];
		console.log("Add address :", tmp[1], "to user :", user, "[", new Date(), "]");

		if(lat === undefined || long === undefined){
			res.send("Syntax error");
			return;
		}

		hu.addAddrToUser(lat, long, user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}

	function _addRangeToUser(res){
		var user = res.message.user.name.toLowerCase();
		var tmp = res.match[1].split(" ");
		var range = tmp[1];
		
		console.log("Add range :", range, "to user :", user, "[", new Date(), "]");

		if(tmp.length < 2){
			res.send("Syntax error");
			return;
		}

		hu.addRangeToUser(range, user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}

	function _enableNotifToUser(res){
		var user = res.message.user.name.toLowerCase();

		hu.enableNotifToUser(user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}

	function _disableNotifToUser(res){
		var user = res.message.user.name.toLowerCase();
		hu.disableNotifToUser(user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}

	function _enableDebugToUser(res){
		var user = res.message.user.name.toLowerCase();

		hu.enableDebugToUser(user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}

	function _disableDebugToUser(res){
		var user = res.message.user.name.toLowerCase();

		hu.disableDebugToUser(user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}
	
	function _setTimerToUser(res){
		var user = res.message.user.name.toLowerCase();
		var tmp = res.match[1].split(" ");
		var timer = tmp[1];

		hu.setTimerToUser(timer, user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}
	function _setLocaleToUser(res){
		var user = res.message.user.name.toLowerCase();
		var tmp = res.match[1].split(" ");
		var locale = tmp[1];
		
		if(locale){
			hu.setLocaleToUser(locale, user, function(err, data){
				if(err){
					res.send(err);
				}else{
					res.send(data);
				}
			});
		}else{
			res.send("Please enter a paramater! pogo locale <en|fr|de>")
		}

		
	}

	function _showPreferencesByUser(res){
		var user = res.message.user.name.toLowerCase();

		hu.showPreferencesByUser(user, function(err, data){
			if(err){
				res.send(err);
			}else{
				res.send(data);
			}
		});
	}

	function _getPokemonById(res){
		var tmp = res.match[1].split(" ");
		var id = tmp[1];
		var user = res.message.user.name.toLowerCase();
		hu.searchList(user, function(err,usr){
			if(err){
				res.send(err)
			}
			var pokename = pu.getPokemonById(id, usr.locale);
			if(pokename){
				var spriteurl = "http://inva.fr/hubot-pogo/" + id;
				if(id < 152){
					spriteurl += ".png";
				}else{
					spriteurl += ".gif";
				}
				res.send(pokename + "\n" + spriteurl);
			}else{
				res.send(id + " can't be found! The Pokédex goes from #1 to #721.");
			}
		});
	}
	
	//Using wikis from Encyclopaediae Pokemonis http://www.encyclopaediae-pokemonis.org/
	function _searchOnPokemonWiki(res){
		var tmp = res.match[1].split("search");
		var query = encodeURIComponent(res.match[2].trim());
		var user = res.message.user.name.toLowerCase();
		hu.searchList(user, function(err,usr){
			if(err){
				res.send(err)
			}
			var wiki = pu.getWiki(usr.locale);
			res.send("Searching on " + wiki.name + ", in " + wiki.language + ".\n" + wiki.searchurl + query + "\n_Not your language? Use pogo locale to change it!_")
		});
	}
	
}

module.exports = main;
