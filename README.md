# gulp-multifile



## Getting Started


you may install this plugin with this command:

```shell
npm install gulp-multifile --save-dev
```

##Setup

Once the plugin has been installed, it may be enabled inside your gulpfile with this line of JavaScript:



```js
var multifile = require('gulp-multifile');


gulp.task('gen:scss', function() {
    gulp.src('src/data/*.json')
        .pipe(multifile({
            template: "src/template/sass.tpl",
            rename: function(paths, data, dataFile) {
                paths.dirname = path.basename(dataFile.basename, '.json')
                paths.basename = data.name;
                paths.extname = ".scss";
                return paths;
            }
        }))
        .pipe(gulp.dest('src/sass'));

        // src/data/file1.json => `{ name: 'file1-0'}`
        // output file => src/sass/file1/file1-0.scss

});


```


##Options


**Plugin options** are:

|       Property       | Necessary |    Type    |         Plugin default value        |
| -------------------- | --------- | ---------- | ----------------------------------- |
| template             | yes       | `String`   | undefined                           |
| rename               | yes       | `Function` | undefined                           |
| [filter]             | no        | `Function` | null                                |
| [extdata]            | no        | 'Object'   | '{}'                                |
| [varname / variable] | no        | `String`   | 'data', _.templateSettings.variable |
| [escape]             | no        | 'RegExp'   | _.templateSettings.escape           |
| [evaluate]           | no        | 'RegExp'   | _.templateSettings.evaluate         |
| [interpolate]        | no        | 'RegExp'   | _.templateSettings.interpolate      |
| [engine]             | no        | 'Function' | undefined                           |
	

More detailed explanation is below.

#### options.template
Type: `String`
Default value: `undefined`

The template file for collection generating

#### options.rename
Type: `Function`
Default value: `undefined`

Can define rename function to output your file which you should return `Object` including keys `dirname`, `basename`, `extname` in order to make file relative path.

```js
	rename: function(paths, data, dataFile) {
	    paths.dirname = path.basename(dataFile.basename, '.json')
	    paths.basename = data.name;
	    paths.extname = ".scss";
	    return paths; 
        // return the path object for building file relative path
	}

```




#### options.filter
Type: `Function`
Default value: `undefined`

Can define filter function to skin the item data render which you should `return false`.


```js
filter: function(data, file){
    // data is json model data
    // file is json file

    // you should return value here 
}

```



#### options.varname / options.variable
Type: `String`
Default value: `data`


lodash templateSettings `_.templateSettings.variable`

Used to reference the data object in the template text.


#### options.escape
Type: `RegExp`
Default value: `_.templateSettings.escape`


lodash templateSettings `_.templateSettings.escape`

Used to detect `data` property values to be HTML-escaped.


#### options.evaluate
Type: `RegExp`
Default value: `_.templateSettings.evaluate`


lodash templateSettings `_.templateSettings.evaluate`

Used to detect code to be evaluated.


#### options.interpolate
Type: `RegExp`
Default value: `_.templateSettings.interpolate`


lodash templateSettings `_.templateSettings.interpolate`

Used to detect `data` property values to inject.


#### options.engine
Type: `Function`
Default value: `undefined`
@return {Function} compiled source method

Used to repalce lodash template with other template engine.

```js

engine: function(templatefile){
    return doT.template(templatefile);
}

```

##Note

####Json File
the json pass from gulp.src , which their format as following is correct:


**Array**

`[{ 'name': 'I am name'},{ 'name': 'name also'}]` 

generate two file, which this json is a collection file.

**Object**

`{ 'name' : 'model'}`

generate one file, which this json is a model file.


####Template Engine

we use `lodash.template` to do this, you can set the parameter `varname`.





##Demo
see the [cozhihu](https://github.com/icai/cozhihu) project.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Gulp](http://gulpjs.com/).



## License
Copyright (c) 2016 Terry Cai. Licensed under the MIT license.
