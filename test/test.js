'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var multifile = require('../');



describe('template parameter', function() {
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

	it('should json collection data rended files match target files', function (cb) {
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

	it('should json model data filter rended file match target content', function (cb) {
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

	it('should json collection data filter rended files match target files', function (cb) {
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



