module.exports = function(grunt) {
    var secrets = require("./secrets.js");
    grunt.loadNpmTasks('grunt-screeps');

    grunt.initConfig({
        screeps: {
            options: {
                email: secrets.email,
                password: secrets.password,
                branch: 'dev',
                ptr: false
            },
            dist: {
                src: ['dist/**/*.js']
            }
        }
    });
    grunt.registerTask("default", ["screeps"])
}