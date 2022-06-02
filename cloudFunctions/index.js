// import {stripeSecretKey, stripeEndpointSecret} from './live_api_keys.js'
// const stripeKeys = require('./live_api_keys.js')

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
require('firebase-admin/auth');
require('firebase-admin/firestore');
admin.initializeApp();

const config = functions.config().env
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);

// user custom claims are: admin, permanentAccess, expirationDate, stripeId

//// AVAILABLE INFO FROM admin.auth().listUsers()
// {
// customClaims: {...},
// disabled: false,
// displayName: "Name",
// email: "test@example.com",
// emailVerified: false,
// metadata: {creationTime: "Sat, 25 Jul 2020 18:48:18 GMT", lastSignInTime: "Sat, 25 Jul 2020 19:04:08 GMT", lastRefreshTime: "Sat, 25 Jul 2020 19:04:08 GMT"},
// passwordHash: "",
// passwordSalt: "",
// phoneNumber: null,
// photoURL: null,
// providerData: [{
//     displayName: "Name", email: "test@example.com", phoneNumber: null, photoURL: null,
//     providerId: "password", uid: "test@example.com", tenantId: null
// }],
// tokensValidAfterTime: "Sat, 25 Jul 2020 18:48:18 GMT",
// uid: "",
// }

exports.getUsers = functions.https.onCall(async (data, context) => {
    let claims = (await admin.auth().getUser(context.auth.uid)).customClaims
    if(!claims.admin) return new Error('Access Denied')

    let userData = (await admin.firestore().collection('users').get())
        .docs.reduce((cum, d)=>{cum[d.id]=d.data(); return cum}, {}) //.map(d=>{return {id:d.id, data:d.data()}})
    let usersResult = await admin.auth().listUsers()
    // return the filtered / merged list of data (dont send over password hash, etc)
    let combined = usersResult.users.map(u=>{return {
        uid:u.uid,
        displayName:u.displayName,
        email:u.email,
        emailVerified:u.emailVerified,
        metadata:u.metadata,
        customClaims:u.customClaims,
        userData: userData[u.uid]}})
    return combined
})

exports.setUser = functions.https.onCall(async (data, context) => {
    let claims = (await admin.auth().getUser(context.auth.uid)).customClaims
    if(!claims.admin) return new Error('Access Denied')

    let user = await admin.auth().getUser(data.uid)
    // delete if needed
    if(data.delete) {
        functions.logger.log('deleting user', user)
        await admin.auth().deleteUser(data.uid)

    } else {
        // set claims
        functions.logger.log('new claims:', {...user.customClaims, ...data.customClaims})
        await admin.auth().setCustomUserClaims(data.uid, {...user.customClaims, ...data.customClaims})
        
        // set memory power
        await admin.firestore().doc(`users/${user.uid}`).set(data.userData)
    
        // general info is user-settable only?
    }
})

exports.renewSubscription = functions.https.onRequest(async (request, response) => {
    // Validate request and extract event
    functions.logger.log(`request.body: ${JSON.stringify(request.body)}`)
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, config.STRIPE_ENDPOINT_SECRET);
    } catch (err) {
        functions.logger.error(`Webhook Error: ${err.message}`)
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }
    functions.logger.log(event)

    // Accepts the customer.subscription.updated event
    if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object;
        let stripeCustomer = await stripe.customers.retrieve(subscription.customer)

        // Fulfill the purchase...
        // let doc = await admin.firestore().doc(`checkoutSessions/${subscription.id}`).get()
        // let uid = doc.data().uid
        let uid = stripeCustomer.metadata.firebaseId
        if(uid) {
            functions.logger.log(`uid: ${uid}`)
    
            let claims = (await admin.auth().getUser(uid)).customClaims
            // convert to ms and add two days of buffer
            claims.expirationDate = Math.max(claims.expirationDate, subscription.current_period_end * 1000 + 2 * 24 * 3600 * 1000)
            await admin.auth().setCustomUserClaims(uid, {...claims})
        } else {
            functions.logger.log(`no firebase uid: ${uid}, looking by email`)
            try{
                await admin.auth().getUserByEmail(stripeCustomer.email)
                    .catch(functions.logger.log(`no firebase account for : ${stripeCustomer.email}`))
                    .then(async user => {
                        functions.logger.log(`found user uid: ${user.uid}`)
                        // update stripe
                        await strip.customerse.update(stripeCustomer.id, {metadata: {firebaseId: user.uid}})

                        // fulfil purchase
                        let claims = user.customClaims
                        // convert to ms and add two days of buffer
                        claims.expirationDate = Math.max(claims.expirationDate, subscription.current_period_end * 1000 + 2 * 24 * 3600 * 1000)
                        await admin.auth().setCustomUserClaims(user.uid, {...claims})
                    })
            } catch {
                functions.logger.log('Error setting claims for email')
            }
        }

        // await admin.firestore().doc(`checkoutSessions/${session}`).delete()
    }

    // Return a response to acknowledge receipt of the event
    response.json({received: true});
})

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    let claims = (await admin.auth().getUser(context.auth.uid)).customClaims
    functions.logger.log(claims)

    const options = {
        payment_method_types: ['card'],
        metadata: {firebaseId: context.auth.uid},
        customer: claims.stripeId,
        subscription_data: {
            items: data.items
        },
        success_url: "https://schmudgin.bythebookthebible.com",
        cancel_url: "https://schmudgin.bythebookthebible.com"
    }
    const session = await stripe.checkout.sessions.create(options).catch(e => {
        functions.logger.error('Error Creating Stripe Session: ', JSON.stringify(e))
    })
    // store a db entry mapping session to uid
    // await admin.firestore().doc(`checkoutSessions/${session.id}`).set({...session, uid: context.auth.uid})
    return session
})

exports.initUser = functions.https.onCall(async (data, context) => {
    if(!context.auth) return '[Error] no user'
    let user = (await admin.auth().getUser(context.auth.uid))

    if(!user.customClaims || !user.customClaims.stripeId || !user.customClaims.expirationDate) {
        await initAccess(user)
    }

    return (await admin.auth().getUser(context.auth.uid))
})

exports.initInvalidUsers = functions.https.onRequest(async (request, response) => {
    let usersResult = await admin.auth().listUsers()
    let n = 0
    for(let u of usersResult.users) {
        // functions.logger.log(u.id, u.customClaims)
        if(!u.customClaims || !u.customClaims.stripeId || !u.customClaims.expirationDate) {
            n += 1
            initAccess(u)
        }
    }

    response.json({count: n});
})

exports.initAccess = functions.auth.user().onCreate(initAccess);

async function initAccess(user) {
    // FOR MIGRATION, check if user matches a stripe customer obj and pair them
    let stripeId
    stripeMatches = (await stripe.customers.list({email: user.email, limit: 3})).data
    
    if(stripeMatches.length >= 1) {
        if (stripeMatches.length === 1) functions.logger.log(`one match for ${user.email} ${stripeMatches}`)
        if (stripeMatches.length > 1) functions.logger.warn(`customer with duplicate emails in stripe ${user.email} ${stripeMatches}`)
        
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

    await admin.auth().setCustomUserClaims(user.uid, {stripeId: stripeId, expirationDate: freeDate.valueOf()})
        .catch( reason => {functions.logger.warn(reason)} );

    await admin.firestore().doc(`users/${user.uid}`).set({'refreshToken': Date.now()});

    var endUser = await admin.auth().getUser(user.uid)
    functions.logger.log("final User: ", endUser)
    return endUser
}   

exports.stripeHealth = functions.https.onCall(async (data, context) => {
    // if not connected to stripe
        // if matching stripe account(s), link them
        // if not, create new account

    // if connected to stripe
        // return subscription state [active, canceled, payment errors, duplicated subscription, no subscription]
        // make sure expiration claims match if active
});
