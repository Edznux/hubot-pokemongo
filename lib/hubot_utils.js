var robot;

var DEFAULT_TIMER = 5; // 5 minutes
var DEFAULT_DEBUG = false;
var DEFAULT_NOTIF = true;
var DEFAULT_RANGE = 50;
var DEFAULT_LOCALE = "fr";


var pu = require("./pogo_utils.js");

var setRobot = function(r){
	robot = r;
};

module.exports.setRobot = setRobot;

/*
* Every redis object from this module is prefixed by "pogo_"
*/

/*
* redis :
pogo_addr = [
	{
		"user" : "foo" ,
		"addr": [
			"1.412156/43.15687",
			"1.872156/44.54987"
		],
		"notif": true,
		"debug": false,
		"timer":5,
		"timerLeft":1
	},
	{
		"user" : "bar" ,
		"addr": [
			"1.5268430/43.7321638",
			"1.5443241/44.65786136"
		],
		"notif": true,
		"debug": true,
		"timer":5,
		"timerLeft":3
	}
]
*/

var addAddrToUser = function (lat, long, user, callback){
	var addr = lat+"/"+long;
	var list = robot.brain.get("pogo_addr") || [];

	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			// user already registred an address
			if(list[i].addr.indexOf(addr) == -1){
				list[i].addr.push(addr);
			 	robot.brain.set("pogo_addr", list);
				callback(null, "Address added !");
				return;
			}else{
				callback("Address already exist", null);
				return;
			}
		}
	}

	// if no user has been foud, we create it
	list.push({"user":user, "addr":[addr], "notif":DEFAULT_NOTIF, "debug":DEFAULT_DEBUG, "timer":DEFAULT_TIMER, "timerLeft":DEFAULT_TIMER, "range":DEFAULT_RANGE, "locale":DEFAULT_LOCALE});
	
	robot.brain.set("pogo_addr", list);
	return callback(null, "Address added !");

};

module.exports.addAddrToUser = addAddrToUser;

var deleteAddrToUser = function(lat, long, user, callback){
	searchList(user, function(err, usr){
		var addr = lat+"/"+long;
		var pos;

		if(err){
			return callback(err, null);
		}

		// user already registred an address
		pos = usr.addr.indexOf(addr)
		if(pos !== -1){
			usr.addr.splice(pos, 1);
			return callback(null, "Address deleted !");
		}else{
			return callback("Address does not exist", null);
		}
	});
};

module.exports.deleteAddrToUser = deleteAddrToUser;

var listAddrFromUser = function(user, callback){
	searchList(user, function(err, usr){

		if(err){
			return callback(err, null);
		}
		callback(null, usr.addr);
	});
};

module.exports.listAddrFromUser = listAddrFromUser;

var addRangeToUser = function (range, user, callback){
	
	searchList(user, function(err, usr){

		if(err){
			return callback(err, null);
		}
		if(isNaN(range)){
			return callback(range+" " + pu.getDialogs("not_number",usr.locale), null)
		}
		range = parseInt(range);
		usr.range = range;
		return callback(null, "Range of "+range+" added for user : "+user+" !");
	});

};

module.exports.addRangeToUser = addRangeToUser;

var enableNotifToUser = function (user, callback){

	searchList(user, function(err, usr){

		if(err){
			return callback(err, null);
		}
		usr.notif = true;
		return callback(null, user+" enabled notification !");
	});

};

module.exports.enableNotifToUser = enableNotifToUser;

var disableNotifToUser = function (user, callback){

	searchList(user, function(err, usr){

		if(err){
			return callback(err, null);
		}
		
		usr.notif = false;
		return callback(null, user+" disabled notification !");
	});

};

module.exports.disableNotifToUser = disableNotifToUser;


var enableDebugToUser = function (user, callback){

	
	searchList(user, function(err, usr){

		if(err){
			return callback(err, null);
		}
	
		usr.debug = true;
		return callback(null, user+" enabled debug !");
	});

};

module.exports.enableDebugToUser = enableDebugToUser;

var disableDebugToUser = function (user, callback){

	searchList(user, function(err, usr){

		if(err){
			return callback(err, null);
		}
		usr.debug = false;
		return callback(null, user+" disabled debug !");
	});
	
};

module.exports.disableDebugToUser = disableDebugToUser;

var setTimerToUser = function (timer, user, callback){
	
	searchList(user, function(err, usr){
		
		if(err){
			return callback(err, null);
		}
		if(isNaN(timer)){
			return callback(timer+" " + pu.getDialogs("not_number",usr.locale), null)
		}
		timer = parseInt(timer);
		usr.timer = timer;
		usr.timerLeft = timer; // reset timerLeft to the new value

		return callback(null, user+" set timer to : "+ timer + " minute(s)");
	});

};

module.exports.setTimerToUser = setTimerToUser;

var showPreferencesByUser = function (user, callback){


	searchList(user, function(err, usr){
		
		var msg ="";

		if(err){
			return callback(err, null);
		}
		msg += "Preferences for user : "+usr.user + "\n";
		msg += "\t - Debug : "+ (usr.debug ? "Enabled" : "Disabled")+"\n";
		msg += "\t - Notification : "+ (usr.notif ? "Enabled" : "Disabled")+"\n";
		msg += "\t - Range (+/-) : "+ usr.range+"\n";
		msg += "\t - Notification interval : "+ usr.timer + " ( "+usr.timerLeft+" minute(s) left)"+"\n";
		msg += "\t - Locales : "+ usr.locale + "\n";
		msg += "\t - List of address(es) : \n";
		
		for(var j=0; j < usr.addr.length; j++){
			msg+="\t\t " + usr.addr[j]+"\n";
		}

		return callback(null, msg);
	});

};

module.exports.showPreferencesByUser = showPreferencesByUser;


var setLocaleToUser = function (locale, user, callback){

	if(!pu.LOCALES.hasOwnProperty(locale)){
		return callback("Locale " + locale + " not found", null);
	}

	searchList(user, function(err, usr){

		if(err){
			return callback(err, null);
		}
		usr.locale = locale;

		return callback(null, "Locale set to : "+ locale + " for " + user);
	});

};

module.exports.setLocaleToUser = setLocaleToUser;

function searchList(user, callback){
	var list = robot.brain.get("pogo_addr") || [];
	var found = false;

	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			return callback(null, list[i]);
		}
	}

	return callback("User unknown, please `pogo add <lat> <lon>` before", null);
}
module.exports.searchList = searchList;