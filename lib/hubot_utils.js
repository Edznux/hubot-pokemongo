var robot;

var DEFAULT_TIMER = 5; // 5 minutes
var DEFAULT_DEBUG = false;
var DEFAULT_NOTIF = true;
var DEFAULT_RANGE = 50;

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
			// if user has been found and updated
		}
	}

	// if no user has been foud, we create it
	list.push({"user":user, "addr":[addr], "notif":DEFAULT_NOTIF, "debug":DEFAULT_DEBUG, "timer":DEFAULT_TIMER, "timerLeft":DEFAULT_TIMER, "range":DEFAULT_RANGE});
	
	robot.brain.set("pogo_addr", list);
	return callback(null, "Address added !");

};

module.exports.addAddrToUser = addAddrToUser;

var deleteAddrToUser = function(lat, long, user, callback){
	var addr = lat+"/"+long;
	var list = robot.brain.get("pogo_addr") || [];
	var pos;
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			// user already registred an address
			pos = list[i].addr.indexOf(addr)
			if(pos !== -1){
				list[i].addr.splice(pos, 1);
				robot.brain.set("pogo_addr", list);
				callback(null, "Address deleted !");
			}else{
				callback("Address does not exist", null);
			}
			return;
		}
	}
};

module.exports.deleteAddrToUser = deleteAddrToUser;

var listAddrFromUser = function(user, callback){

	var list = robot.brain.get("pogo_addr") || [];

	console.log("robot brain ====",robot.brain.get("pogo_addr"));
	var tmp = null;
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			tmp = list[i].addr
		}
	}
	if(tmp === null ){
		callback("No address found for user : "+ user , null);
	}else{
		callback(null, tmp);
		
	}
};

module.exports.listAddrFromUser = listAddrFromUser;

var addRangeToUser = function (range, user, callback){

	var list = robot.brain.get("pogo_addr") || [];
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			list[i].range = range;
		}
	}
	
	robot.brain.set("pogo_addr", list);
	return callback(null, "Range of "+range+" added for user : "+user+" !");

};

module.exports.addRangeToUser = addRangeToUser;

var enableNotifToUser = function (user, callback){

	var list = robot.brain.get("pogo_addr") || [];
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			list[i].notif = true;
		}
	}
	
	robot.brain.set("pogo_addr", list);
	return callback(null, user+" enabled notification !");

};

module.exports.enableNotifToUser = enableNotifToUser;

var disableNotifToUser = function (user, callback){

	var list = robot.brain.get("pogo_addr") || [];
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			list[i].notif = false;
		}
	}
	
	robot.brain.set("pogo_addr", list);
	return callback(null, user+" disabled notification !");

};

module.exports.disableNotifToUser = disableNotifToUser;


var enableDebugToUser = function (user, callback){

	var list = robot.brain.get("pogo_addr") || [];
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			list[i].debug = true;
		}
	}
	
	robot.brain.set("pogo_addr", list);
	return callback(null, user+" enabled debug !");

};

module.exports.enableDebugToUser = enableDebugToUser;

var disableDebugToUser = function (user, callback){

	var list = robot.brain.get("pogo_addr") || [];
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			list[i].debug = false;
		}
	}
	
	robot.brain.set("pogo_addr", list);
	return callback(null, user+" disabled debug !");

};

module.exports.disableDebugToUser = disableDebugToUser;

var setTimerToUser = function (timer, user, callback){

	var list = robot.brain.get("pogo_addr") || [];
	for(var i=0; i < list.length; i++){
		if(list[i].user === user){
			list[i].timer = timer;
			list[i].timerLeft = timer; // reset timerLeft to the new value
		}
	}
	
	robot.brain.set("pogo_addr", list);
	return callback(null, user+" set timer to : "+ timer + " minute(s)");

};

module.exports.setTimerToUser = setTimerToUser;