var gulp = require('gulp');
var beefy = require('beefy');
var http = require('http');
var handler = beefy({
	entries: [require('../config').js.JS_DEST_BROWSERIFIED_FILE],
	cwd: require('../config').js.ROOT_PATH
});

gulp.task('run', function(){
  return http.createServer(handler).listen(8000);
});
