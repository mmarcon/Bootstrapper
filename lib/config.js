/**********************************************************/
/***** DO NOT EDIT UNLESS YOU KNOW WHAT YOU ARE DOING *****/
/**********************************************************/
var userFolder = process.env['HOME'];
var bootsrapperFolder = userFolder + '/.bootstrapper';
var templateFolder = bootsrapperFolder + '/templates';
var logFolder = bootsrapperFolder + '/log';

module.exports = {
	userFolder: userFolder,
	bootsrapperFolder: bootsrapperFolder,
	templateFolder: templateFolder,
	logFolder: logFolder,
	packageFile: 'template.json'
};
/**********************************************************/
/**********************************************************/
/**********************************************************/