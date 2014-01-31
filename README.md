# liftoff [![Build Status](https://secure.travis-ci.org/tkellen/node-liftoff.png)](http://travis-ci.org/tkellen/node-liftoff)
> Launch your command line tool with ease.

[![NPM](https://nodei.co/npm/liftoff.png)](https://nodei.co/npm/liftoff/)

### What?
Say you're writing a CLI tool.  Let's call it `hack`.  You want to configure hack for your projects using a `Hackfile`.  This is node, you install `hack` locally for each project you use it on.  But, in order to get the `hack` command in your PATH, you also install it globally.

Now, when you run the `hack` command, you want it to use the `Hackfile` in your current directory, and the local installation of `hack`, too.  It'd be nice if it traversed up your folders until it found one, for those times when you're not in the root directory of your project.  Heck, you might even want to launch it from a folder outside of your project by manually specifying a working directory.  liftoff manages this for you.

So, everything is working great.  Now we can find your local `hack` and `Hackfile` with ease.  Unfortunately, it turns out you authored your `Hackfile` in coffee-script, or some other js variant.  In order to support *that*, you have to load the compiler for it, and then register the extension for it with node.  Good news, liftoff can do that too.

### Examples
Check out [the example liftoff command](/blob/master/bin/liftoff.js) to see how you might use this.

To see liftoff in action now, install it with `npm install -g liftoff`, then make a Hackfile.js with some arbitrary javascript it, and run `liftoff` while in the same parent folder.
