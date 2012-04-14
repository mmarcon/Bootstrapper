/********************************/
/* Add modules here when needed */
/********************************/
var config = require('./config');
var utils = require('./utils');
var fs = require('fs');
var path = require('path');
var rl = require('readline');
var wrench = require('wrench');
/********************************/
/********************************/
/********************************/

/*******************************/
/*  Colors for console output  */
/*******************************/
var red     = '\033[31m';
var blue    = '\033[34m';
var yellow  = '\033[33m';
var reset   = '\033[0m';
/*******************************/
/*******************************/
/*******************************/

var Bootstrapper = function(args){
	this.executable = args.shift();
	this.dir = process.cwd();
	this.method = args.shift();
	this.args = args;
},
$B = Bootstrapper.prototype;

$B.init = function(){
	var stat;
	//Check template directory existence
	if (!path.existsSync(config.templateFolder) ||
		!fs.lstatSync(config.templateFolder).isDirectory()) {
		console.log('Looks like this is the first time you use Bootstrapper.');
		console.log('Setting up folders.');
		console.log('Bootstrapper folder: [' + config.bootsrapperFolder + ']');
		fs.mkdirSync(config.bootsrapperFolder);
		console.log('Templates folder: [' + config.templateFolder + ']');
		fs.mkdirSync(config.templateFolder);
		console.log('Log folder: [' + config.logFolder + ']');
		fs.mkdirSync(config.logFolder);
	}
	if(!$B[this.method]){
		this.help();
	}
	else {
		this[this.method].call(this);
	}
};

/* Methods: to add a new command to bootstrapper just add a method here */
/* Available instance variables:
 * - this.executable: full path of the executable run by the user
 * - this.dir: current working directory
 * - this.method: method name
 * - this.args: arguments array
 *
 * - config.userFolder: the user home folder
 * - config.bootsrapperFolder: the application settings folder
 * - config.templateFolder: the folder where the templates are stored
 * - config.packageFile: filename for the template file descriptor (JSON format, typically template.json)
 */

$B.help = function(){
	console.log(this.executable);
	console.log(this.dir);
};

$B.list = function(){
	//Read all files in template directory
	var files, templates;
	files = fs.readdirSync(config.templateFolder);
	templates = files.filter(function(f){
		return fs.lstatSync(config.templateFolder + '/' + f).isDirectory();
	});
	if (templates.length === 0) {
		console.log('No templates are currently present');
		return;
	}
	templates.forEach(function(t){
		var templateDescriptor;
		try {
			templateDescriptor = JSON.parse(fs.readFileSync(config.templateFolder + '/' + t + '/' + config.packageFile));
			if (templateDescriptor) {
				console.log(yellow + templateDescriptor.name + reset + ' ['
					+ templateDescriptor.description + ', '
					+ ' Created by ' + templateDescriptor.author + ' on '
					+ templateDescriptor.date + ']');
			}
		}
		catch(e) {
			console.error(e);
		}
	});
};

$B.add = function(){
	var templateDescriptor;
	try {
		templateDescriptor = JSON.parse(fs.readFileSync(this.args[0] + '/' + config.packageFile));
		console.log('Adding "' + templateDescriptor.name + '"...');
		wrench.copyDirSyncRecursive(this.dir + '/' + this.args[0], config.templateFolder + '/' + this.args[0]);
		console.log('Done!');
	}
	catch(e) {
		console.error(e);
	}
};

$B.remove = function(){
	
};

$B.use = function(){
	
};

$B.generate = function(){
	var stdin = rl.createInterface(process.stdin, process.stdout, null);
	var template = {}, dirname, d = new Date();

	template.date = d.getDate() + '/' + (d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '/' + d.getFullYear();
	stdin.question('Template name [Untitled Template]:', function(name) {
		template.name = name || 'Untitled Template';
		stdin.question('Template description []: ', function(desc) {
			template.description = desc || '';
			stdin.question('Template author [' + process.env.USER + ']: ', function(author) {
				template.author = author || process.env.USER;
				dirname = './' + template.name.replace(/\s/g, '_').toLowerCase();
				fs.mkdirSync(dirname);
				fs.writeFileSync(dirname + '/' + config.packageFile, JSON.stringify(template, null, 4));
				stdin.close();
				process.stdin.destroy();
			});
		});
	});
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