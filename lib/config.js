/**********************************************************/
/***** DO NOT EDIT UNLESS YOU KNOW WHAT YOU ARE DOING *****/
/**********************************************************/
var userFolder = process.env['HOME'];
var bootstrapperFolder = userFolder + '/.bootstrapper';
var templateFolder = bootstrapperFolder + '/templates';
var logFolder = bootstrapperFolder + '/log';

module.exports = {
	userFolder: userFolder,
	bootstrapperFolder: bootstrapperFolder,
	templateFolder: templateFolder,
	logFolder: logFolder,
	packageFile: 'template.json'
};
/**********************************************************/
/**********************************************************/
/**********************************************************/