# My Project Template

**This is my project template**
**Clone this repo when you start working on a new project.**

## Preparation
You need the following applications in order to use this project.
* bundler
  * `gem install bundler`
* bower
  * `npm install -g bower`
* grunt
  * `npm install grunt`
    * If you have not installed grunt before, try the following command
      * `npm install -g grunt-cli` (you might need `sudo`)

## Dependencies
This project depends on the following packages.
* Gruntjs
  * grunt-pagespeed
  * grunt-contrib-clean
  * grunt-contrib-copy
  * grunt-mkdir
  * grunt-critical
* Bower
  * knockout
  * normalize-css
* Sass
  * (Required): bundler

## How to Use

### Preparation
```sh
git clone <THIS_REPOSITORY_URL>
cd <THIS_REPOSITORY>

# This installs bower packages in bower.js
bower install

# This installs SASS compiler
bundle install --path vendor/bundle

# This installs the grunt plugins in package.js
npm install
```

### Development
* when you want to compile SASS to CSS
```sh
bundle exec sass
```

