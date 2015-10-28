# My Project Template

**This is my project template**
**Clone this repo when you start working on a new project.**

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
  * Required: bundler

## How to Use

### Preparation
```sh
git clone <THIS_REPOSITORY_URL>
cd <THIS_REPOSITORY>

# This installs SASS
bundle install --path vendor/bundle

# This installs the grunt plugins
npm install
```

### Development
* when you want to compile SASS to CSS
```sh
bundle exec sass
```

