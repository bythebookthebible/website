# Purpose

This is the Schmudgin website for [ByTheBookTheBible.com](https://ByTheBookTheBible.com). The purpose of By the Book is to enable anyone to easily memorize whole books of the bible, because God speaks most clearly through His word. The role of the Schmudgin website in particular is to make this process fun and accessible to younger kids. 

This site is published at [schmudgin.bythebookthebible.com](https://schmudgin.bythebookthebible.com), where it runs as a Progressive Web App for desktop and mobile.

# Development
This project runs on nodejs, and uses React and Redux.

Make sure your system has nodejs and npm from [nodejs.org](https://nodejs.org). The package manager (npm) should come with a nodejs download.

`npm install` to install this project's dependencies.

`npm start` starts a development server at [http://localhost:3000](http://localhost:3000). The page will reload if you make edits.

`npm run build` builds the app for production to the `build` folder.

# Deployment

We are currently hosting this project with firebase for its database and google cloud storage and auth. `npm install -g firebase-tools` will install the firebase cli and make the firebase command globally available. 

`firebase login` You will need to login to google through the cli to deploy successfully.

`firebase deploy` deploys the project from the build directory. You can deploy specific portions of the project by adding options like `--only hosting` or `--only functions:initUser`.


# Useful Tools

I have found the chrome [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
and [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
to be very useful for this kind of project.

# File Structure

In `functions/index.js` you will find the functions which are running in google cloud. These primarilly callable functions which handle tasks that require restricted permissions like granting the appropriate access to new users, or allowing an administrator to edit user's memory jewels.

Under `src/playfulMode` you will find most of the schmudgin specific code, by feature. The state logic will be in the files named `*Reducer.js`, and the rendering logic will generally be in the correspondingly named React file `*.js`.

More information will be made available in the [github wiki](https://github.com/bythebookthebible/website/wiki).

# Fresh project setup notes

- You need to setup cloud storage with CORS, as in https://firebase.google.com/docs/storage/web/download-files#cors_configuration
- You will need to hack in the first account with custom claims having "admin: true" in order to manage users
- If you have old users without the refreshToken in their user profile (firestore/users) they will not load until fixed
- You need to add at least one regular video, one generated video, and the timesteps before the simpleUI will display anything
- The default selection is (currently) hard coded to James 1:1-4 Schmideo (58-001-001-004)
