# The PLAN:

-----------------

general assets (fonts, icons...)

shared code for this site
shared code for all front ends
shared code for backends too

templates for some pages
specific code per page
PWA code
Server side rendering code (future)

-----------------

public (aka just copy these)
  fonts
  logos
  robots.txt
  manifest.json

sharedUtil
  math / shared data structures / API constants

sharedUI
  layoutStyles
  themingStyles

  sharedWidgets .html/.js

  firebase.js (generic front-end loading of firebase, but also need shared code to plug into auth+DB for each page)

  loginWidgets .partial.html/.js/.scss (combine login widgets together)

pages
  account/forgot .html/.js/.scss
  index .html/.js ()

  markdownPages (compile-time generation from md & html template)

build.js (custom loaders, webpack, something custom & simpler in the future)

-----------------

Build System:
- web page components compile to html
- knows dependendies which need to be copied
- handles single-page-components with scss and babel loaders
- handles recursive imports (including in different languages)
- prepares PWA (Workbox?)
- manage & inject .env secrets
- detect or declare target outputs
- multiple targets sharing a template, but different data

-----------------

static
    robots.txt
    HelveticaNeue Light.ttf
    firasans.woff2
    logoSpinning.svg
    logo.svg
    Athelas-Regular.ttf
    Loopiejuice.ttf
    Harrington.ttf
    logo.png
    manifest.json

shared
    firebase.js
    htmlRecursiveLoader.js
    fonts.scss
    util.js
    colors.scss
    head.partial.html
    reboot.scss

memorize
    forgot.js
    forgot.html
    forgot.scss

    account.js
    account.html
    account.scss

    index.js
    index.html
    index.scss

    login.scss
    login.partial.html
    _template.html

plainPages
    privacy.html
    terms.html
    privacy.md
    terms.md
    plain.scss

README.md
.env.development
.env.production
.gitignore
.babelrc
webpack.config.js
package-lock.json
package.json
