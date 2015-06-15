/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.initConfig({
        bower: {
            install: {
                options: {
                    targetDir: "dependencies",
                    layout: "byComponent",
                    cleanTargetDir: false
                }
            }
        },
		bump: {  
			scripts: {
				files: ["./lib/zumo-adal.js"],
				updateConfigs: ["pkg"],
				commitFiles: ["-a"],
				push: false
			}
		}
    });

    // This command registers the default task which will install bower packages into wwwroot/lib
    grunt.registerTask("default", ["bower:install"]);

    // The following line loads the grunt plugins.
    // This line needs to be at the end of this this file.
    grunt.loadNpmTasks("grunt-bower-task");
	grunt.loadNpmTasks('grunt-bump');
};