'use strict';


var fs = require('fs');
var path = require('path');
var through = require("through2");
var gutil = require('gulp-util');
var template = require('lodash.template');

var isType = function(obj, str){
    return Object.prototype.toString.call(obj).toLowerCase().slice(8,-1) === str;
}


var multifile = function(options) {
    var PLUGIN_NAME = 'gulp-multifile';
    var templatePath = options.template;
    var rename = options.rename || function(pa, data, dataFile) {
        throw new gutil.PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Invalid rename');
    }
    var filter = options.filter || null;
    var filterResult;
    if (!templatePath) {
        throw new gutil.PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Invalid template');
    }

    var fileTpl = fs.readFileSync(templatePath, "utf8");

    var tmpl;

    if(isType(options.engine, 'function')){
        /**
         * [tmpl description]
         * @type {Function} compiled source method
         */
        tmpl = options.engine(fileTpl);
    } else {
        var settings = {};
        if(options.varname !== undefined){
            settings['variable'] = options.varname;
        }
        if(options.variable !== undefined){
            settings['variable'] = options.variable;
        } 
        if(settings['variable'] === undefined){
            settings['variable'] = "data";
        }
        if(options.escape)
            settings['escape'] = options.escape;
        if(options.evaluate)
            settings['evaluate'] = options.evaluate;
        if(options.interpolate)
            settings['interpolate'] = options.interpolate;
        tmpl = template(fileTpl, settings);
        
    }


    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            cb(null, file);
            return;
        }
        if (file.isStream()) {
            cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }
        file = new gutil.File(file);
        var fileContents = JSON.parse(file.contents.toString('utf8'));

        if(isType(fileContents, 'object')){
            fileContents = [fileContents];
        }

        fileContents.forEach(function(item, index) {
            if(filter){
                filterResult = filter.call(null, item, file);
                if(filterResult === false)
                    return false;
            }

            var data = rename.call(null, {}, item, file);
            var tmpldata = item;
            if(options.extdata){
                tmpldata['extdata'] = options.extdata;
            }
            var cwd = process.cwd();
            var base = path.join(cwd, '/');
            var generateFile = new gutil.File({
                cwd: cwd,
                base: base,
                path: path.join(base, path.join(data.dirname, data.basename + data.extname)),
                contents: new Buffer(tmpl(tmpldata)),
            });
            this.push(generateFile);
        }.bind(this));

        cb();
    })
}


module.exports = multifile;