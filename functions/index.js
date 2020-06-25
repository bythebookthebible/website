import {stripeSecretKey, stripeEndpointSecret} from '../api_keys.js'

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const stripe = require('stripe')(stripeSecretKey);

// user custom claims are: admin, permanentAccess, expirationDate, stripeId

exports.getUsers = functions.https.onCall(async (data, context) => {
    let claims = (await admin.auth().getUser(context.auth.uid)).customClaims
    console.log(claims)
    if(!claims.admin) {
        return new Error('Access Denied')
    }

    usersResult = await admin.auth().listUsers()
    console.log(usersResult)
    return usersResult
})

exports.setUser = functions.https.onCall(async (data, context) => {
    let claims = (await admin.auth().getUser(context.auth.uid)).customClaims
    console.log(claims)
    if(!claims.admin) {
        return new Error('Access Denied')
    }

    user = await admin.auth().getUser(data.uid)
    console.log('new claims:', {...user.customClaims, ...data.customClaims})
    await admin.auth().setCustomUserClaims(data.uid, {...user.customClaims, ...data.customClaims})
})

exports.renewSubscription = functions.https.onRequest(async (request, response) => {
    // Validate request and extract event
    console.log(`request.body: ${JSON.stringify(request.body)}`)
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, stripeEndpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`)
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Accepts the customer.subscription.updated event
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        let stripeCustomer = await stripe.customers.retrieve(subscription.customer)

        // Fulfill the purchase...
        // let doc = await admin.firestore().doc(`checkoutSessions/${subscription.id}`).get()
        // let uid = doc.data().uid
        let uid = stripeCustomer.metadata.firebaseId
        console.log(`uid: ${uid}`)

        let claims = (await admin.auth().getUser(uid)).customClaims
        claims.expirationDate = subscription.current_period_end * 1000; // convert to ms
        await admin.auth().setCustomUserClaims(uid, {...claims})

        // await admin.firestore().doc(`checkoutSessions/${session}`).delete()
    }

    // Return a response to acknowledge receipt of the event
    response.json({received: true});
})

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    let claims = (await admin.auth().getUser(context.auth.uid)).customClaims
    console.log(claims)

    const options = {
        payment_method_types: ['card'],
        metadata: {firebaseId: context.auth.uid},
        customer: claims.stripeId,
        subscription_data: {
            items: data.items
        },
        success_url: 'https://bythebookthebible.com/memorize',
        cancel_url: 'https://bythebookthebible.com/subscribe',
    }
    const session = await stripe.checkout.sessions.create(options).catch(e => {
        console.error('Error Creating Stripe Session: ', JSON.stringify(e))
    })
    // store a db entry mapping session to uid
    // await admin.firestore().doc(`checkoutSessions/${session.id}`).set({...session, uid: context.auth.uid})
    return session
})

exports.initAccess = functions.auth.user().onCreate(async user => {
    // FOR MIGRATION, check if user matches a stripe customer obj and pair them
    let stripeId
    stripeMatches = (await stripe.customers.list({email: user.email, limit: 3})).data
    console.log('matches ', stripeMatches)

    if(stripeMatches.length === 1 && !stripeMatches[0].metadata.firebaseId) {
        stripeId = stripeMatches[0].id
        // give customer metadata firebase uid to fulfill subscription
        await stripe.customers.update(stripeId, {metadata: {firebaseId: user.uid}})
    } else {
        // After Migration, just create new stripe customer
        customer = await stripe.customers.create({email: user.email, metadata: {firebaseId: user.uid}})
        stripeId = customer.id
    }

    // Set a default 30 day trial
    var freeDate = new Date();
    freeDate.setDate(freeDate.getDate() + 30); // 30 days free

    await admin.auth().setCustomUserClaims(user.uid, {stripeId: stripeId, expirationDate: freeDate.valueOf()});
});

// CAMP FORM ENDPOINTS

exports.addStudent = functions.https.onCall(async (data, context) => {
    // CHECK DATA
    console.log(data);

    await admin.firestore().collection('summercamps/' + data.location + '/students').add(
        {
            fname: data.fname, 
            lname: data.lname, 
            email: data.email, 
            phone: data.phone, 
            numStudents: Number(data.numStudents), 
            notes: data.notes,
        }.bind(data));
    await updateCampNumStudents(data.location);
});

exports.addCamp = functions.https.onCall(async (data, context) => {
    // CHECK DATA
    console.log(data);

    await admin.firestore().collection('summercamps').doc(data.location).set(
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

exports.addVenue = functions.https.onCall(async (data, context) => {
    // CHECK DATA
    console.log(data);

    // add/update venue option list
    await admin.firestore().collection('summercamps/' + data.location + '/venueOptions').add(
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
    await admin.firestore().doc('summercamps/' + data.location).update({venueStatus: 'idea'});
});

async function updateCampNumStudents(location) {
    console.log('updating num students')
    querySnapshot = await admin.firestore().collection('summercamps/' + location + '/students').get()
    numStudents = querySnapshot.docs.map(function(doc) {
        return Number(doc.data().numStudents);
    }).reduce((a,b) => a + b, 0);
    await admin.firestore().doc('summercamps/' + location).update({numStudents: numStudents});
}