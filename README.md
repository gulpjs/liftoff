# liftoff [![Build Status](https://secure.travis-ci.org/tkellen/node-liftoff.png)](http://travis-ci.org/tkellen/node-liftoff)
> Launch your command line tool with ease.

[![NPM](https://nodei.co/npm/liftoff.png)](https://nodei.co/npm/liftoff/)

### What?
Say you're writing a CLI tool.  Let's call it [hacker](http://github.com/tkellen/node-hacker).  You want to configure it using a `Hackerfile`.  This is node, so you install `hacker` locally for each project you use it in.  But, in order to get the `hacker` command in your PATH, you also install it globally.

Now, when you run the `hacker` command, you want it to use the `Hackerfile` in your current directory, and the local installation of `hacker` next to it.  It'd be nice if it traversed up your folders until it found a `Hackerfile`, for those times when you're not in the root directory of your project.  Heck, you might even want to launch it from a folder outside of your project by manually specifying a working directory.  Liftoff manages this for you.

So, everything is working great.  Now you can find your local `hacker` and `Hackerfile` with ease.  Unfortunately, it turns out you've authored your `Hackerfile` in coffee-script, or some other JS variant.  In order to support *that*, you have to load the compiler for it, and then register the extension for it with node.  Good news, Liftoff can do that too.

### Examples
Check out [the hacker project](https://github.com/tkellen/node-hacker/blob/master/bin/hacker.js) to see how you might use this.

### Try it now
Want to see how the above example works?

1. Install the sample project `hacker` with `npm install -g hacker`
2. Make a `Hackerfile.js` with some arbitrary javascript it.
3. Run `hacker` while in the same parent folder.

For extra credit, try writing your `Hackerfile` in coffeescript.  Then, run `hacker --require coffee-script`.  Make sure you install coffee-script locally, though!
