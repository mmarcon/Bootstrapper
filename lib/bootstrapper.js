/********************************/
/* Add modules here when needed */
/********************************/
var config = require('./config');
var fs = require('fs');
var path = require('path');
var rl = require('readline');
var wrench = require('wrench');
var req = require('request');
var exec = require('child_process').exec;
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
$B = Bootstrapper.prototype,
_addLocalTemplate, _isRemoteTemplate, _addRemoteTemplate, _generateTemplateJSON, _StdInputManager;

_StdInputManager = (function(){
	var stdinInstance,
	stdin = function(){
		if (!stdinInstance) {
			stdinInstance = rl.createInterface(process.stdin, process.stdout, null);
		}
		return stdinInstance;
	},
	terminate = function(){
		if (stdinInstance) {
			stdinInstance.close();
			process.stdin.destroy();
			stdinInstance = null;
		}
	};

	return {
		stdin: stdin,
		terminate: terminate
	}
})();

$B.initialize = function(){
	//Exception handler
	process.on('uncaughtException', function(e) {
		console.log(e);
		_StdInputManager.terminate();
	});
	var stat;
	//Check template directory existence
	if (!path.existsSync(config.templateFolder) ||
		!fs.lstatSync(config.templateFolder).isDirectory()) {
		console.log('Looks like this is the first time you use Bootstrapper.');
		console.log('Setting up folders.');
		try {
			console.log('Bootstrapper folder: [' + config.bootstrapperFolder + ']');
			fs.mkdirSync(config.bootstrapperFolder, 0755);
		} catch(e) {
			if(e.errno && e.errno === 17) {
				console.log('[' + config.bootstrapperFolder + '] already exists, skipping.');
			} else {
				throw e;
			}
		}
		try {
			console.log('Templates folder: [' + config.templateFolder + ']');
			fs.mkdirSync(config.templateFolder, 0755);
		} catch(e) {
			if(e.errno && e.errno === 17) {
				console.log('[' + config.templateFolder + '] already exists, skipping.');
			} else {
				throw e;
			}
		}
		try {
			console.log('Log folder: [' + config.logFolder + ']');
			fs.mkdirSync(config.logFolder, 0755);
		} catch(e) {
			if(e.errno && e.errno === 17) {
				console.log('[' + config.logFolder + '] already exists, skipping.');
			} else {
				throw e;
			}
		}
	}
	if(!$B[this.method] || this.method === 'initialize'){
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
 * - config.bootstrapperFolder: the application settings folder
 * - config.templateFolder: the folder where the templates are stored
 * - config.packageFile: filename for the template file descriptor (JSON format, typically template.json)
 */

$B.help = function(){
	console.log('Usage: ' + this.executable + ' <help|list|generate|add|remove|use> [arguments]');
	console.log('  * help: shows this help');
	console.log('  * list: lists all the available templates');
	console.log('  * generate: creates an empty template');
	console.log('  * init: converts current directory into a Bootstrapper template (adds a template.json file)');
	console.log('  * add: adds a template to the template database. Takes the path to the template folder to add to the database as argument.');
	console.log('  * remove: removes a template from the template database. Takes the template name as argument.');
	console.log('  * use: creates a new folder containing the template files. Takes the template name as argument.');
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
		var templateDescriptor = JSON.parse(fs.readFileSync(config.templateFolder + '/' + t + '/' + config.packageFile));
		if (templateDescriptor) {
			console.log(yellow + '* ' + templateDescriptor.name + reset + ' ['
				+ templateDescriptor.description + ', '
				+ ' Created by ' + templateDescriptor.author + ' on '
				+ templateDescriptor.date + ']');
		}
	});
};

$B.add = function(){
	if (_isRemoteTemplate(this.args[0])) {
		_addRemoteTemplate.call(this);
	}
	else {
		_addLocalTemplate.call(this);
	}
};

_isRemoteTemplate = function(string){
	return /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(string);
};

_addLocalTemplate = function(ondone){
	if (!path.existsSync(this.args[0] + '/' + config.packageFile)) {
        //trying ao add a template which is not a template
        //make it one, if the user is fine with that.
        var stdin = _StdInputManager.stdin(), self = this;
        stdin.question('Missing template.json. Create one? [Yes]:', function(yn) {
            yn = yn || 'yes';

            if (yn.toLowerCase() === 'yes') {
            	//For those who don't know: here a good explanation of Function.prototype.bind
            	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
                self.init(_addLocalTemplate.bind(self, ondone));
                //No need to terminate stdin, it will be terminated
            	//by _generateTemplateJSON that is called by init.
            	//@TODO: don't like this way of managing user input, fix it.
            }
            else {
            	_StdInputManager.terminate();
            }
        });
        return;
    }
	var templateDescriptor = JSON.parse(fs.readFileSync(this.args[0] + '/' + config.packageFile));
	console.log('Adding "' + templateDescriptor.name + '"...');
	wrench.copyDirSyncRecursive(this.args[0], config.templateFolder + '/' + path.basename(this.args[0]));
	console.log('Done!');
	if (typeof ondone === 'function') {
		ondone.call(this);
	}
};

_addRemoteTemplate = function(){
	var tempFileName = this.dir + '/' + Date.now() + '_file.tar.gz',
		tempDirName = this.dir + '/' + Date.now() + '_dir',
		tarCommand = 'tar -C' + tempDirName + ' -xzf ' + tempFileName,
		subdirs, self = this;
	fs.mkdirSync(tempDirName, 0755);
	console.log('Contacting remote host...');
	req(this.args[0], function(){
		console.log('Done');
		console.log('Extracting file...');
		exec(tarCommand, function(){
			fs.unlinkSync(tempFileName);
			console.log('Done');
			subdirs = fs.readdirSync(tempDirName);
			subdirs[0] = tempDirName + '/' + subdirs[0];
			//Set args as it will be used by _addLocalTemplate to determine
			//the local directory it is applied to
			self.args = subdirs;
			_addLocalTemplate.call(self, function(){
				wrench.rmdirSyncRecursive(tempDirName, false);
			});
		});
	}).pipe(fs.createWriteStream(tempFileName));
};

$B.remove = function(){
	var files, templates;
	//Read all files in template directory
	files = fs.readdirSync(config.templateFolder);
	//Filter out templates that do not match the name
	templates = files.filter(function(f){
		var templateDescriptor;
		if (fs.lstatSync(config.templateFolder + '/' + f).isDirectory()) {
			templateDescriptor = JSON.parse(fs.readFileSync(config.templateFolder + '/' + f + '/' + config.packageFile));
			if (templateDescriptor.name === this.args[0]) {
				return true;
			}
			return false;
		}
		return false;
	}, this);
	if (templates.length === 1) {
		wrench.rmdirSyncRecursive(config.templateFolder + '/' + templates[0], false);
	}
	else if (templates.length === 0) {
		console.log(red + 'Template not found.' + reset);
	}
	else {
		console.log(red + 'More than one template matching the name provided' + reset);
	}
};

$B.use = function(){
	var files, templates, templateNames = [], stdin, that = this;
	//Read all files in template directory
	files = fs.readdirSync(config.templateFolder);
	//Filter out templates that do not match the name
	templates = files.filter(function(f){
		var templateDescriptor;
		if (fs.lstatSync(config.templateFolder + '/' + f).isDirectory()) {
			templateDescriptor = JSON.parse(fs.readFileSync(config.templateFolder + '/' + f + '/' + config.packageFile));
			if (templateDescriptor.name === this.args[0] || templateDescriptor.name.match(new RegExp(this.args[0]))) {
				templateNames.push(templateDescriptor.name);
				return true;
			}
			return false;
		}
		return false;
	}, this);
	if (templates.length === 1) {
		wrench.copyDirSyncRecursive(config.templateFolder + '/' + templates[0], this.dir + '/' + templates[0]);
	}
	else if (templates.length === 0) {
		console.log(red + 'Template not found.' + reset);
	}
	else {
		stdin = _StdInputManager.stdin();
		console.log(yellow + 'More than one template matching the name provided:');
		templateNames.forEach(function(t,i){
			console.log('[' + i + '] ' + t);
		});
		console.log(reset);
		stdin.question('Which one would you like to use? [0] ', function(n) {
			n = n || 0;
			wrench.copyDirSyncRecursive(config.templateFolder + '/' + templates[n], that.dir + '/' + templates[n]);
			_StdInputManager.terminate();
		});
	}
};

_generateTemplateJSON = function(callback){
	var stdin = _StdInputManager.stdin();
	var template = {}, dirname, d = new Date(), that = this;

	template.date = d.getDate() + '/' + (d.getMonth() < 9 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '/' + d.getFullYear();
	stdin.question('Template name [Untitled Template]:', function(name) {
		template.name = name || 'Untitled Template';
		stdin.question('Template description []: ', function(desc) {
			template.description = desc || '';
			stdin.question('Template author [' + process.env.USER + ']: ', function(author) {
				template.author = author || process.env.USER;
				if (typeof callback === 'function') {
					callback.call(that, template);
				}
				_StdInputManager.terminate();
			});
		});
	});
};

$B.generate = function(){
	_generateTemplateJSON(function(template){
		var dirname = './' + template.name.replace(/\s/g, '_').toLowerCase();
		fs.mkdirSync(dirname, 0755);
		fs.writeFileSync(dirname + '/' + config.packageFile, JSON.stringify(template, null, 4));
	});
};

$B.init = function(callback){
    var destFolder = this.args[0] ? this.args[0] + '/' : '', self = this;
	_generateTemplateJSON(function(template){
		fs.writeFileSync(destFolder + config.packageFile, JSON.stringify(template, null, 4));
		if(typeof callback === 'function'){
		    callback.call(self);
		}
	});
};

/**********************************************************/
/***** DO NOT EDIT UNLESS YOU KNOW WHAT YOU ARE DOING *****/
/**********************************************************/
module.exports = {
	go: function(args){
		var B = new Bootstrapper(args.slice(1));
		B.initialize();
	}
};
/**********************************************************/
/**********************************************************/
/**********************************************************/