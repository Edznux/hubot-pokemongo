var https = require("https");
var hu = require("./hubot_utils.js");

var BASE_URL = "https://pokevision.com/map/data/";
var SCAN_URL = "https://pokevision.com/map/scan/";
var SCAN_COUNT = 0;
var DEFAULT_LOCALE = "fr";
var LOCALES = [];
	LOCALES["fr"] = require("../locales/pokemon.fr.json");
	LOCALES["de"] = require("../locales/pokemon.de.json");
	LOCALES["en"] = require("../locales/pokemon.en.json");

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

							for(var k = 0; k < data.pokemon.length; k++){
								pokemonCoord = data.pokemon[k].latitude + "/" + data.pokemon[k].longitude;
								if(isInRange(addr, pokemonCoord, range)){
									msg += LOCALES[locale][data.pokemon[k].pokemonId]+" en range, Despawn dans :"+((data.pokemon[k].expiration_time- Date.now()/1000)/60).toFixed(2)+"min (lon :"+data.pokemon[k].longitude+ " lat :"+ data.pokemon[k].latitude +")\n";
								}
							}
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
	var lat0 = playerCoord.split("/")[0]
	var lon0 = playerCoord.split("/")[1]
	var pokeLat = pokemonCoord.split("/")[0]
	var pokeLon = pokemonCoord.split("/")[1]
	var inRange = true;
	var maxLat = parseFloat(lat0) + parseFloat((180/Math.PI)*(maxRange/6378137))
	var minLat = parseFloat(lat0) - parseFloat((180/Math.PI)*(maxRange/6378137))
	var maxLon = parseFloat(lon0) + parseFloat((180/Math.PI)*(maxRange/6378137)/Math.cos(lat0))
	var minLon = parseFloat(lon0) - parseFloat((180/Math.PI)*(maxRange/6378137)/Math.cos(lat0))

	// console.log("pokeLat :", pokeLat, "pokeLon", pokeLon);
	// console.log("===== shape =======");
	// console.log("lat :",  minLat, " - ", maxLat, "lon :", minLon , " - ", maxLon);
	//check out of bound
	if(maxLat < pokeLat){
		// console.log("max lat < pokeLat")
		inRange=false;
	}
	if(minLat > pokeLat){
		// console.log("min lat > pokeLat")
		inRange=false;
	}

	if(maxLon < pokeLon){
		// console.log("max lon < pokeLon")
		inRange=false
	}

	if(minLon > pokeLon){
		// console.log("min lon > pokeLon")
		inRange=false;
	}
	return inRange;

}