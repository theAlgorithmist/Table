# Angular 2/Typescript Math Toolkit Statistical Analysis of Tabular Data

This demo exercises the Typescript Math Toolkit *DataStats* and *Table* classes to illustrate the statistical analysis of tabular data.  For comparison purposes, this demo uses the same used car data set described in chapter 2 of 'Machine Learning in R' by Lantz.  A variety of one-way and cross-tab analyses are performed in this demo.

In addition to statistical analysis, this demo illustrates a more production-like environment in terms of building and running an application.  Past demos simply built the application into a *build* folder using Angular 2 development bundles. While this approach is well-suited for ongoing development and debugging, it is not a production-worthy environment.  The code distribution in this project allows both 'dev' and 'prod' folders to be built from separate gulp files.  The 'prod' folder may be considered a release candidate.  Code is automatically inserted during the production build process to place Angular 2 into production mode.  Production framework files are bundled into a single distribution while app files are bundled into a separate file.  This allows one-time load-and-cache of the framework and periodic releases of new application versions.  Bundling is performed without the need for additional packaging/bundling software.  This approach allows the use of System modules and avoids some of the issues associated with System.register encountered by popular bundling packages other than jspm.  Jspm, however, could be used in lieu of npm and as an end-to-end package manager/application bundler.  After the release candidate is tested locally, any variety of CI applications could be used to migrate the production code to a client-facing environment.

The demo itself is visually unimpressive. Angular is used to read data and dynamically create a summary analysis.  The demo code illustrates how to inject Http into a service that is itself injected into a Component.  Subscription to an Observable stream returned from an Http get is illustrated where the stream is created in a service, but consumed by a class method in another component.  Liberal use of ngFor is illustrated in the single external template along with ngIf and Angular2-supplied pipes.

The supplied code uses alpha versions of the *DataStats* and *Table* classes from the Typescript Math Toolkit along with Angular 2 beta 12.  It should be noted that at the time this demo was produced, the full *Chi2* class from the Typescript Math Toolkit had not been completely tested.  So, q-values are returned as zero from cross-tab methods.   

Note that while the demo uses classes from the Typescript Math Toolkit, the entire library is not included with the source distribution.  Each class used in the demo was manually moved out of the TSMT and placed in the *src/lib* folder.

Author:  Jim Armstrong - [The Algorithmist]

@algorithmist

theAlgorithmist [at] gmail [dot] com

## Installation

Installation involves all the usual suspects

  - npm and gulp installed globally
  - Clone the repository
  - npm install
  - get coffee (this is the most important step)

## Introduction

The goals of this demo are 

* Illustrate usage of Typescript Math Toolkit computational classes in an actual application setting
* Add to the body of knowledge on how to create and run Angular 2/Typescript applications, particularly in a production environment
* Show how Excel-style analysis can be easily performed in a client-side application
* Create an excuse for another cup of coffee

I hope that you find something instructive from the code and are interested in improving the demo in some way.

### Version
1.0.0

### Building and Running the demo

All source files are provided in a *src* folder.  Gulp is used to build and run the demo and two gulp files are provided for the 'dev' and 'prod' versions of the code.  The file, *gulpfile.js* controls the 'dev' version while *gulpFile-prod.js* controls the 'prod' version.  For development and debugging, there are a number of gulp tasks which are documented below.

```sh
$ gulp clean (deletes everything in the dev folder)
$ gulp copy:html (copies the index.html file from /src to /dev)
$ gulp copy:templates (copies all angular 2 templates files into dev folder)
$ gulp copy:css (copies all css files into dev folder - you can add a build step if you like SaSS)
$ gulp copy:assets (copies all visual assets into dev folder)
$ gulp copy:framework (copies all Angular 2 framework files into appropriate location - should only need to be done once)
$ gulp tslint (lints all Typescript files in the source)
$ gulp compile (compiles all src .ts files and places them in the appropriate build location)
$ gulp serve (launch a browser and run the application while watching for file changes)
$ gulp copy:all (copies everything except the framework files)
$ gulp build:all (clean, copy all files, lint, and compile)
```

After installing the demo, execute _gulp build:all_ to create a ready-to-run application in the *dev* folder.  Execute _gulp serve_ to serve up the application and run the debug version of the demo.  After loading, click the 'Get Data' button.  This action loads the json data and then performs the analysis.  The demo display expands to show the full results of each analysis.  Expected values are documented in the source code.

Afterwards, you need only execute the specific task needed for any modifications.

To create a release candidate, execute _gulp --gulpfile gulpfile-prod.js build:all_ to create a ready-to-run application in the *prod* folder.  Execute _gulp --gulpfile gulpfile-prod.js serve_ to run the application.  Note the bundling of framework files into _a2-bundle.js_ and application files into _app-bundle.js_ .  Study the _tsconfi-prod.json_ file to see how the _--outFile_ Typescript compiler option is used.

The demo has been tested in late-model Chrome on a Mac. 


### Contributions

Contributions and coffee are highly encouraged as I believe the best demo is one that allows ample room for improvement, much of which is suggested in the internal documentation of the .ts files.  In particular, the UI could use some visual enhancement :)

Unless it is a very tiny mod or bug fix, please place your complete source in a new folder, i.e. 'using-jspm' or 'new-framework'.  Submit pull requests to theAlgorithmist [at] gmail [dot] com.


License
----

Apache 2.0

**Free Software? Yeah, Homey plays that**

[//]: # (kudos http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

[The Algorithmist]: <http://algorithmist.net>
