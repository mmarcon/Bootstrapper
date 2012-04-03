/********************************/
/* Add modules here when needed */
/********************************/
var config = require('./config');
var utils = require('./utils');
var fs = require('fs');
var path = require('path');
/********************************/
/********************************/
/********************************/

var Bootstrapper = function(args){
	this.executable = args.shift();
	this.method = args.shift();
	this.args = args;
},
$B = Bootstrapper.prototype;

$B.init = function(){
	var stat;
	//Check template directory existence
	if (!path.existsSync(config.templateFolder) ||
		!fs.lstatSync(config.templateFolder).isDirectory()) {
		console.log('No templates were found.');
	}
	else if(!$B[this.method]){
		console.error('Method does not exist');
	}
	else {
		this[this.method].call(this);
	}
};

/* Methods: to add a new command to bootstrapper just add a method here */
/* Available instance variables:
 * - this.executable: full path of the executable run by the user
 * - this.method: method name
 * - this.args: arguments array
 *
 * - config.userFolder: the user home folder
 * - config.bootsrapperFolder: the application settings folder
 * - config.templateFolder: the folder where the templates are stored
 */

$B.help = function(){
	
};

$B.list = function(){

};

$B.add = function(){
	
};

$B.remove = function(){
	
};

$B.use = function(){
	
};





/**********************************************************/
/***** DO NOT EDIT UNLESS YOU KNOW WHAT YOU ARE DOING *****/
/**********************************************************/
module.exports = {
	go: function(args){
		var B = new Bootstrapper(args.slice(1));
		B.init();
	}
}
/**********************************************************/
/**********************************************************/
/**********************************************************/