'use strict';
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var multifile = require('../');



describe('template and rename parameter', function() {
	it('should compile template to target content', function (cb) {
		var stream = multifile({
			template: 'test/fixture.tpl',
			rename: function(path){
				return {
					dirname: '',
					basename: 'fixture',
					extname: '.html'
				}
			}
		});
		stream.once('data', function (file) {
			assert.equal(file.relative, 'fixture.html');
			assert.equal(file.contents.toString(), '<p><em>foo</em></p>');
		});
		stream.on('end', cb);

		stream.write(new gutil.File({
			path: 'fixture.json',
			contents: new Buffer('{ "name": "name1"}')
		}));
		stream.end();
	});

	it('should json model data rended file match target content', function (cb) {
		var stream = multifile({
			template: 'test/fixture-data.tpl',
			rename: function(path){
				return {
					dirname: '',
					basename: 'fixture',
					extname: '.html'
				}
			}
		});
		stream.once('data', function (file) {
			assert.equal(file.relative, 'fixture.html');
			assert.equal(file.contents.toString(), '<p><em>foo</em></p>\nname1\ncat');
		});
		stream.on('end', cb);

		stream.write(new gutil.File({
			path: 'fixture.json',
			contents: new Buffer('{ "name": "name1", "color": "cat"}')
		}));
		stream.end();
	});

	it('should json collection data render files match target files', function (cb) {
		var stream = multifile({
			template: 'test/fixture-data.tpl',
			rename: function(path, data, json){
				return {
					dirname: 'dir',
					basename: 'fixture' + data.name,
					extname: '.html'
				}
			}
		});
		stream.once('data', function (file) {
			assert.equal(file.relative, 'dir/fixturename1.html');
			assert.equal(file.contents.toString(), '<p><em>foo</em></p>\nname1\ncat');

			stream.once('data', function (file) {
				assert.equal(file.relative, 'dir/fixturename2.html');
				assert.equal(file.contents.toString(), '<p><em>foo</em></p>\nname2\ndog');
			});
		});
		stream.on('end', cb);
		stream.write(new gutil.File({
			path: 'fixture.json',
			contents: new Buffer('[{ "name": "name1", "color": "cat"}, { "name": "name2", "color": "dog"}]')
		}));
		stream.end();
	});
});



describe('filter parameter', function() {

	it('should json model data filter render file match target content', function (cb) {
		var stream = multifile({
			template: 'test/fixture-data.tpl',
			rename: function(path){
				return {
					dirname: '',
					basename: 'fixture',
					extname: '.html'
				}
			},
			filter: function(data, json){
				return false
			}
		});
		var fileContent = "";
		stream.once('data', function (file) {
			fileContent += file.contents.toString();
			
		});
		stream.on('end', function(){
			assert.equal(fileContent, "");
			cb()
		});

		stream.write(new gutil.File({
			path: 'fixture.json',
			contents: new Buffer('{ "name": "name1", "color": "cat"}')
		}));
		stream.end();
	});

	it('should json collection data filter render files match target files', function (cb) {
		var stream = multifile({
			template: 'test/fixture-data.tpl',
			rename: function(path, data, json){
				return {
					dirname: 'dir',
					basename: 'fixture' + data.name,
					extname: '.html'
				}
			},
			filter: function(data, json){
				return !(data.name  == 'name1');

			}
		});

		var fileContent = "";
		stream.once('data', function (file) {
			fileContent += file.contents.toString();
			stream.once('data', function (file) {
				fileContent += file.contents.toString();
				assert.fail(file.contents.toString(), '<p><em>foo</em></p>\nname2\ndog' , "catch exception file", '==');
			});
		});
		stream.on('end', function(){
			assert.equal(fileContent, '<p><em>foo</em></p>\nname2\ndog');
			cb();
		});
		stream.write(new gutil.File({
			path: 'fixture.json',
			contents: new Buffer('[{ "name": "name1", "color": "cat"}, { "name": "name2", "color": "dog"}]')
		}));
		stream.end();
	});
});


describe('engine parameter', function() {

	it('should engine prividor render file match json content', function (cb) {
		var stream = multifile({
			template: 'test/fixture-data.tpl',
			rename: function(path){
				return {
					dirname: '',
					basename: 'fixture',
					extname: '.html'
				}
			},
			engine: function(templatefile){
				return function(data){
					return JSON.stringify(data);
				}

			}
		});

		stream.once('data', function (file) {
			var json = JSON.parse(file.contents.toString());
			assert.equal(file.relative, 'fixture.html');
			assert.equal(json.name, "name1");
			assert.equal(json.color, "cat");
		});
		stream.on('end', cb);

		stream.write(new gutil.File({
			path: 'fixture.json',
			contents: new Buffer('{ "name": "name1", "color": "cat"}')
		}));
		stream.end();
	});


	it('should engine prividor render file match template content', function (cb) {
		var stream = multifile({
			template: 'test/fixture-data.tpl',
			rename: function(path){
				return {
					dirname: '',
					basename: 'fixture',
					extname: '.html'
				}
			},
			engine: function(templatefile){
				return function(data){
					return templatefile;
				}

			}
		});

		stream.once('data', function (file) {
			assert.equal(file.relative, 'fixture.html');
			assert.equal(file.contents.toString(), fs.readFileSync('test/fixture-data.tpl', "utf8"));
		});
		stream.on('end', cb);

		stream.write(new gutil.File({
			path: 'fixture.json',
			contents: new Buffer('{ "name": "name1", "color": "cat"}')
		}));
		stream.end();
	});

});
