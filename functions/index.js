// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

exports.initAccess = functions.auth.user().onCreate((user) => {
    var freeDate = new Date();
    freeDate.setDate(freeDate.getDate() + 30); // 30 days free

    admin.auth().setCustomUserClaims(user.uid, {admin: false, subscribed: false, freeUntil: freeDate});
});

exports.addStudent = functions.https.onCall((data, context) => {
    // CHECK DATA
    console.log(data);

    admin.firestore().collection('summercamps').doc(data.location).collection('students').add(
        {
            fname: data.fname, 
            lname: data.lname, 
            email: data.email, 
            phone: data.phone, 
            numStudents: data.numStudents, 
            notes: data.notes,
        }).then(function(ref) {
            console.log(ref)
            updateCampNumStudents(data.location);
        }.bind(data));
});

exports.addCamp = functions.https.onCall((data, context) => {
    // CHECK DATA
    console.log(data);

    admin.firestore().collection('summercamps').doc(data.location).set(
        {
            fname: data.fname, 
            lname: data.lname, 
            email: data.email, 
            phone: data.phone, 
            location: data.location,
            numStudents: 0, 
            startDate: new Date(data.startDate),
            venueStatus: 'needed',
            venue: data.venue,
            notes: data.notes,
        });
});

exports.addVenue = functions.https.onCall((data, context) => {
    // CHECK DATA
    console.log(data);

    // add/update venue option list
    admin.firestore().collection('summercamps').doc(data.location).collection('venueOptions').add(
        {
            fname: data.fname, 
            lname: data.lname, 
            email: data.email, 
            phone: data.phone, 
            venueType: data.venueType,
            scheduling: data.scheduling,
            notes: data.notes,
        });

    // change status to pending
    admin.firestore().collection('summercamps').doc(data.location).update({venueStatus: 'idea'});
});

function updateCampNumStudents(location) {
    console.log('updating num students')
    admin.firestore().collection('summercamps').doc(location).collection('students').get().then((querySnapshot) => {
            numStudents = querySnapshot.docs.map(function(doc) {
                return Number(doc.data().numStudents);
            }).reduce((a,b) => a + b, 0);
            admin.firestore().collection('summercamps').doc(location).update({numStudents: numStudents});
        });
}