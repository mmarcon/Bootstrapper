var Utils = {};

Utils.CLI = {
	hasParam: function(args, parameter) {
		return args.indexOf(parameter) > -1;
	},
	getValueForParam: function (args, parameter) {
		var pos = args.indexOf(parameter);
		if (pos < 0 || pos === args.length - 1) {
			return null;
		}
		return args[pos + 1];
	}
};

module.exports = Utils;