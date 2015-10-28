#!/bin/bash

# This installs bower packages in bower.js
bower install

# This installs SASS compiler
bundle install --path vendor/bundle

# This installs the grunt plugins in package.js
npm install

