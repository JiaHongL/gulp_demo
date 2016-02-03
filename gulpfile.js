var gulp = require('gulp');
var webserver = require('gulp-webserver'); 
var compass   = require('gulp-compass'); 
var gutil   = require('gulp-util');  
var concat = require('gulp-concat'); //合併
var uglify = require('gulp-uglify'); //壓縮
var rename = require("gulp-rename"); //重新命名
//備註:記得先去安裝上面這些模組

// I.建立 Webserver
gulp.task('Webserver', function() {
  gulp.src('./www')
    .pipe(webserver({
      port:8000,
      livereload: true,
      directoryListing: false,
      open: true,
      fallback: 'www/index.html'
    }));
});

// II.Compass(Scss->Css)
gulp.task('Compass',function(){
    return gulp.src('./www/style/scss/*.scss')
        .pipe(compass({
            sourcemap: true,
            time: true,
      css: './www/style/css/',
      sass: './www/style/scss/',
      style: 'compact'
        }))
        .pipe(gulp.dest('./www/style/css/'));
})

//III.controllers下的全部js檔案 合併 至merge資料夾下
gulp.task('merge', function() {
  return gulp.src('./www/js/controllers/*.js')
    .pipe(concat('AllJs.js'))
    .pipe(gulp.dest('./www/merge/'));
});

//IV.merge下的js檔案 壓縮 至min資料夾下
gulp.task('compress', function() {
  setTimeout((function() {
    return gulp.src('./www/merge/*.js')
      .pipe(uglify())
      .pipe(rename(function(path) {
        path.basename += ".min";
        path.extname = ".js";
      }))
      .pipe(gulp.dest('./www/min/'));    
  }), 100);  
});

//<--help-->
gulp.task('help', function() {
  console.log('[help] gulp constants_dev ------- 產出開發環境所使用的「全域變數」');
  console.log('[help] gulp constants_pro ------- 產出正式環境所使用的「全域變數」');
  console.log('[help] gulp Dev           ------- 啟動開發環境[Web Server][localhost]');
  console.log('[help] gulp Pro           ------- 啟動正式環境[Web Server][localhost]');
  console.log('[help] gulp output_dev    ------- 輸出開發專案至output資料夾下');
  console.log('[help] gulp output_pro    ------- 輸出正式專案至output資料夾下');
});

//<---生成filename文件，存入string内容--->
function string_src(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}

//V.開發環境[參數設定]
gulp.task('constants_dev', function() {
  //读入config.json文件
  var myConfig = require('./config.json');
  //取出開發的配置
  var envConfig = myConfig.development;
  //產生json
  var conConfig = 'appconfig = ' + JSON.stringify(envConfig);
  //生成config.js文件
  return string_src("./config.js", conConfig)
      .pipe(gulp.dest('./www/config'))
});

//VI.正式環境[參數設定]
gulp.task('constants_pro', function() {
  //读入config.json文件
  var myConfig = require('./config.json');
  //取出正式的配置
  var envConfig = myConfig.production;
  //產生json
  var conConfig = 'appconfig = ' + JSON.stringify(envConfig);
  //生成config.js文件
  return string_src("./config.js", conConfig)
      .pipe(gulp.dest('./www/config'))
});

//VII.監視
gulp.task('Watch',function(){
    gulp.watch('./www/style/scss/*.scss',['Compass']);
    gulp.watch('./www/js/controllers/*.js',['merge']);
    gulp.watch('./www/merge/*.js',['compress']);
});

//拷貝六層內資料夾內容
gulp.task('copy', function() {
  return gulp.src(['./www/*.*','./www/*/*.*','./www/*/*/*.*','./www/*/*/*/*.*','./www/*/*/*/*/*.*','./www/*/*/*/*/*/*.*','./www/*/*/*/*/*/*/*.*'])
    .pipe(gulp.dest('./output/www/'));
});

// 開發模式
gulp.task('Dev',['constants_dev','Webserver','Compass','merge','compress','Watch']);
// 正式模式
gulp.task('Pro',['constants_pro','Webserver','Compass','merge','compress','Watch']);

// 輸出開發專案至output資料夾
gulp.task('output_dev',['constants_dev','copy']);
// 輸出正式專案至output資料夾
gulp.task('output_pro',['constants_pro','copy']);

// 
gulp.task('default',['constants_dev','Webserver','Compass','merge','compress','Watch']);
 
