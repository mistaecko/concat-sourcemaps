"use strict";

var path = require("path");
var concat = require("../src/concat-sourcemaps.js").concat;

module.exports = function(grunt) {

    grunt.registerMultiTask("concat-sourcemaps", "Combines Source Map files while concatenating JavaScript source files.", function() {
        var files = this.files;

        // Iterate over all specified file groups.
        files.forEach(function (f) {
            grunt.file.mkdir(path.dirname(f.dest));
            concat(f.src, f.dest);
        });
    });

};
