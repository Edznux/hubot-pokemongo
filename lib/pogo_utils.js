var https = require("https");
var geolib = require("geolib");

var hu = require("./hubot_utils.js");

var BASE_URL = "https://pokevision.com/map/data/";
var SCAN_URL = "https://pokevision.com/map/scan/";
var SCAN_COUNT = 0;
var DEFAULT_LOCALE = "e,";
var LOCALES = [];
	LOCALES["fr"]["pokemon"] = require("../locales/fr.pokemon.json");
	LOCALES["fr"]["wiki"] = require("../locales/fr.wiki.json");
	LOCALES["de"]["pokemon"] = require("../locales/de.pokemon.json");
	LOCALES["de"]["wiki"] = require("../locales/de.wiki.json");
	LOCALES["en"]["pokemon"] = require("../locales/en.pokemon.json");
	LOCALES["en"]["wiki"] = require("../locales/en.wiki.json");

module.exports.LOCALES = LOCALES;

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
		var addr, lat,long;
		
		for(var j=0; j<list[i].addr.length; j++){
			// async bloc, care !
			(function(list, i, j){
			
				addr = list[i].addr[j]
				if(list[i].notif){
					if(list[i].timerLeft == undefined){
						list[i].timerLeft = list[i].timer;
					}
					if(list[i].timerLeft > 0){
						list[i].timerLeft--;
						// decrement the timer left
					}else{
						// timerLeft == 0, reset to timer and perform action
						list[i].timerLeft = list[i].timer;
						getPokemonByAddr(addr, function(err,data){
							if(err){
								return console.error(err);
							}
							var pokemonCoord;
							var msg="";
							var range = list[i].range == null ? 100 : list[i].range;
							var locale = list[i].locale == null ? DEFAULT_LOCALE : list[i].locale;

							console.log("====================="+list[i].user+"================");
							for(var k = 0; k < data.pokemon.length; k++){
								pokemonCoord = data.pokemon[k].latitude + "/" + data.pokemon[k].longitude;
								if(isInRange(addr, pokemonCoord, range)){
									msg += LOCALES[locale][data.pokemon[k].pokemonId]+" en range, Despawn dans :"+((data.pokemon[k].expiration_time- Date.now()/1000)/60).toFixed(2)+"min (lon :"+data.pokemon[k].longitude+ " lat :"+ data.pokemon[k].latitude +")\n";
								}
							}
							console.log("++++++++++++++++++++++"+list[i].user+"++++++++++++++++++");

							if(msg == "" && list[i].debug){
								robot.messageRoom(list[i].user,"DEBUG : no pokemon found in "+range+"m range");
							}
							
							robot.messageRoom(list[i].user,msg);
						});
					}
				}
			})(list, i, j);
		}
	}

	console.log(list);
}
module.exports.alertNearby = alertNearby;

var isInRange = function(playerCoord, pokemonCoord, maxRange){
	var lat = playerCoord.split("/")[0];
	var lon = playerCoord.split("/")[1];
	var pokeLat = pokemonCoord.split("/")[0];
	var pokeLon = pokemonCoord.split("/")[1];

	console.log("lat",lat,"| lon",lon,"| pokeLat", pokeLat,"| pokeLon", pokeLon)
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
	return LOCALES["pokemon"][locale][id]
}
module.exports.getPokemonById = getPokemonById;

var getWiki = function(locale){
	if(!locale){
		locale = DEFAULT_LOCALE;
	}
	return LOCALES["wiki"][locale][id]
}
module.exports.getWiki = getWiki;
