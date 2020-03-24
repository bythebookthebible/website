var firebase = require('firebase')
require('firebase/functions');
var firebaseConfig = {
    apiKey: "AIzaSyBa--bg9-LoBToy8OBTS_pXhrn58VdLpNg",
    authDomain: "bythebookthebible.firebaseapp.com",
    databaseURL: "https://bythebookthebible.firebaseio.com",
    projectId: "bythebookthebible",
    storageBucket: "bythebookthebible.appspot.com",
    messagingSenderId: "45489637137",
    appId: "1:45489637137:web:0d91a0788e90356d3c6eb0"
};

// Initialize Firebase
firebase = firebase.initializeApp(firebaseConfig);
export default firebase;
// var db = firebase.firestore();
