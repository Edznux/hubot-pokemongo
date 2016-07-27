var https = require("https");
var geolib = require("geolib");

var hu = require("./hubot_utils.js");

var BASE_URL = "https://pokevision.com/map/data/";
var SCAN_URL = "https://pokevision.com/map/scan/";
var SCAN_COUNT = 0;
var DEFAULT_LOCALE = "en";
var LOCALES = [];

var LOCALE_LIST = ["fr","en","de"];
for(var locale in LOCALE_LIST){
	LOCALES[LOCALE_LIST[locale]] = require("../locales/"+LOCALE_LIST[locale]+".json");
}

module.exports.LOCALES = LOCALES;
module.exports.LOCALE_LIST = LOCALE_LIST;

/**
* Just needed for robot.brain.set and get functions
*/
var setRobot = function(r){
	robot = r;
};

module.exports.setRobot = setRobot;

/**
* Return balance for the address provided in parameters
* Params:
* 	- lat : latitude.
* 	- long : longitude.
*	- callback : callback function. (err, data);
*/
var getPokemonByAddr = function(addr, callback){
	var url = BASE_URL+addr;
	console.log(url);
	https.get(url,function(res){
		var data="";
		var err = null;

		res.on('data', function(d) {
			data+=d;
		});

		res.on('end', function(){
			try{
				data = JSON.parse(data);
				if(data.status !== "success"){
					callback("Error in the status of the nearest pokemon", null);
				}else{
					callback(err, data);
				}
			}catch(e){
				console.error('Error while getting nearest pokemon : ', e);
				console.error(data);
				return callback("Error while getting nearest pokemon", null);
			}
		});
	});
};

module.exports.getPokemonByAddr = getPokemonByAddr;

var newScan = function(){
	var list = robot.brain.get("pogo_addr") || [];
	var tmpList = [];
	var url;
	for(var i=0; i < list.length; i++){
		for(var j=0; j<list[i].addr.length; j++){
			tmpList.push(list[i].addr[j]);
		}
	}

	addr = tmpList[SCAN_COUNT]
	url = SCAN_URL+addr;

	console.log("Scan request for :", addr, "at", new Date(), "scan count :", SCAN_COUNT+1, "over",tmpList.length)
	
	https.get(url,function(res){
		var data="";
		var err = null;

		res.on('data', function(d) {
			data+=d;
		});

		res.on('end', function(){
			try{
				data = JSON.parse(data);
				if(data.status !== "success"){
					console.error("Error in the status of the scan : ", data);
				}else{
					//updating count
					if(SCAN_COUNT < tmpList.length - 1){		
						SCAN_COUNT++;
					}else{
						SCAN_COUNT=0;
					}
					console.log(data);
				}
			}catch(e){
				console.error('Error while scanning :', e);
				console.error(data)
			}
		});
	});
}
module.exports.newScan = newScan;

var alertNearby = function(){

	var list = robot.brain.get("pogo_addr") || [];

	for(var i=0; i < list.length; i++){

		for(var j=0; j<list[i].addr.length; j++){
			// async bloc, care !
			checkNearby(list[i], list[i].addr[j])
		}
	}

	console.log(list);
}
module.exports.alertNearby = alertNearby;

function checkNearby(user, addr){
	if(user.notif){
		if(user.timerLeft == undefined){
			user.timerLeft = user.timer;
		}
		if(user.timerLeft > 0){
			user.timerLeft--;
			// decrement the timer left
		}else{
			// timerLeft == 0, reset to timer and perform action
			user.timerLeft = user.timer;
			getPokemonByAddr(addr, function(err,data){
				if(err){
					return console.error(err);
				}
				var pokemonCoord;
				var msg="";
				var range = user.range == null ? 100 : user.range;
				var locale = user.locale == null ? DEFAULT_LOCALE : user.locale;

				console.log("====================="+user.user+"================");
				for(var k = 0; k < data.pokemon.length; k++){
					pokemonCoord = data.pokemon[k].latitude + "/" + data.pokemon[k].longitude;
					// console log all pokemon recieved
					if(user.debug){
						console.log("lat :", addr.split("/")[0],"| lon :",addr.split("/")[1], "| pokeLat :", data.pokemon[k].latitude, "| pokeLon :", data.pokemon[k].longitude);
					}

					if(isInRange(addr, pokemonCoord, range)){
						
						msg += getPokemonById([data.pokemon[k].pokemonId], locale) + " ";
						msg += getDialogs(user.locale, "in_range") + " ";
						msg += getDialogs(user.locale, "despawn_in") + " ";
						msg += ((data.pokemon[k].expiration_time- Date.now()/1000)/60).toFixed(2)+"min ";
						msg += "(lon :"+data.pokemon[k].longitude+ " lat :"+ data.pokemon[k].latitude +")";
						
						if(user.debug){
							msg+="("+data.pokemon[k].id+")";
						}
						
						msg+="\n";
					}
				}
				console.log("++++++++++++++++++++++"+user.user+"++++++++++++++++++");

				if(msg == "" && user.debug){
					return robot.messageRoom(user.user, getDialogs("no_pokemon_found",user.locale) + range + "m");
				}
				
				robot.messageRoom(user.user,msg);
			});
		}
	}
}

var isInRange = function(playerCoord, pokemonCoord, maxRange){
	var lat = playerCoord.split("/")[0];
	var lon = playerCoord.split("/")[1];
	var pokeLat = pokemonCoord.split("/")[0];
	var pokeLon = pokemonCoord.split("/")[1];

	var inRange = geolib.isPointInCircle(
		{latitude: lat, longitude: lon},
		{latitude: pokeLat, longitude: pokeLon},
		maxRange
	);

	return inRange;

}

var getPokemonById = function(id, locale){
	if(!locale){
		locale = DEFAULT_LOCALE;
	}
	return LOCALES[locale]["pokemon"][id];
}
module.exports.getPokemonById = getPokemonById;

var getWiki = function(locale){
	if(!locale){
		locale = DEFAULT_LOCALE;
	}
	return LOCALES[locale]["wiki"];
}
module.exports.getWiki = getWiki;

var getDialogs = function(locale, item){
	if(!locale){
		locale = DEFAULT_LOCALE;
	}
	var output = LOCALES[locale]["dialogs"][item];

	if(!output){
		return LOCALES["en"]["dialogs"][item];
	}
	return output;
}
module.exports.getDialogs = getDialogs;
