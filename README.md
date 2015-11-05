# My Neighborhood Map Project

## How to Run

Everything is in the repo.
So, just run the app with `SimpleHTTPServer`. (Or, any http server app)
```sh
git clone <THIS_REPOSITORY_URL>
cd <THIS_REPOSITORY>

python -m SimpleHTTPServer
```

## Directory Structure

* When you run the grunt task, `grunt` , it will copy files from `/dev` to `/public`.
```
<project root>
|
---- public: contains files that are referenced from the app
|       - css: contains all the css files
|           - lib: css libraries
|           - fonts: font files
|       - js: contains all the js files
|           -  models: contains models
|           -  lib: js libraries
|
---- dev: contains all the files that are under development (change the files under this dir.)
|       - css: contains all the css files
|       - js: contains all the js files
|
---- bower_components
...
```

## Development
You need the following applications in order to use this project.
* bundler
  * `gem install bundler`
* bower
  * `npm install -g bower`
* grunt
  * `npm install grunt`
    * If you have not installed grunt before, try the following command
      * `npm install -g grunt-cli` (you might need `sudo`)


### Dependencies
This project depends on the following packages.
* Gruntjs
  * grunt-contrib-clean
  * grunt-contrib-copy
  * grunt-contrib-cssmin
  * grunt-contrib-uglify
* Bower
  * knockout
  * jquery
  * bootstrap
* Sass
  * (Required): bundler

### Development
* You need to change the file in /dev dir only.

### Preparation
* Run the command below to install necessary packages (even you have bower_components in you repo, you still need to install grunt plugins and possibly sass)
```sh
# This will do the installation.
chmod +x prepare.sh
./prepare.sh
```

### Commands
* Let the grunt task, `grunt` to handle the compile.
* When you are ready, run `grunt prod` to minify the source files.
* when you want to compile SASS to CSS
```sh
bundle exec sass input.scss output.css
bundle exec sass --watch sass/input.scss:css/output.css
```
 (For more info about using Sass)
  * http://sass-lang.com/documentation/file.SASS_REFERENCE.html

## References
 * https://github.com/tastejs/todomvc/tree/gh-pages/examples/knockoutjs_require
* http://knockoutjs.com/documentation/introduction.html
