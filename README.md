# grunt-knox

> Knox Tasks for GruntJS

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-knox --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-knox');
```

## The "knox" task

### Overview
In your project's Gruntfile, add a section named `knox` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  test: {
    options: {
      key: "key",
      secret: "secret",
      bucket: "bucket",
      saveTo: '/'
    },
    files: {
      folder: './test/knox_test.gzip'
    },
  },
  //...
})
```

### Usage Examples
Define your options in the config, set the files.folder to your compressed file path. Then just do `grunt build` and `grunt deploy`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
