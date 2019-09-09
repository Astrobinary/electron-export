module.exports = config => {
	config.target = "electron-renderer";

	config.module.rules.unshift({
		test: /\.handlebars$/,
		use: [
			{
				loader: "handlebars-loader",
				query: {
					helperDirs: [__dirname + "/src/helpers"]
				}
			}
		]
	});

	return config;
};
