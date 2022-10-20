// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
require('firebase-admin/auth');
require('firebase-admin/firestore');
admin.initializeApp();

const config = functions.config().env
const stripe = require('stripe')(config.STRIPE_SECRET_KEY);


exports.getUsers = functions.https.onCall(async (data, context) => {
    let claims = (await admin.auth().getUser(context.auth.uid)).customClaims
    if(!claims.admin) return new Error('Access Denied')

    let userData = (await admin.firestore().collection('users').get())
        .docs.reduce((cum, d)=>{cum[d.id]=d.data(); return cum}, {}) //.map(d=>{return {id:d.id, data:d.data()}})
    let usersResult = await admin.auth().listUsers()
    // return the filtered / merged list of data (dont send over password hash, etc)
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

        let uid = stripeCustomer.metadata.firebaseId
        if(!uid) {
            // Bad stripe metadata
            functions.logger.log(`no firebase uid, looking by email. This is self-healing.`)
            await admin.auth().getUserByEmail(stripeCustomer.email)
                .catch(()=>{
                    const msg = `Webhook Error: no account to apply subscription for "${stripeCustomer.uid}"`
                    functions.logger.log(msg)
                    response.status(400).send(msg);
                })
                .then(async user => {
                    functions.logger.log(`found user uid: ${user.uid}`)
                    // relink stripe / firebase id
                    await stripe.customers.update(stripeCustomer.id, 
                        {metadata: {firebaseId: user.uid}}
                    )

                    await admin.auth().setCustomUserClaims(user.uid, 
                        {...user.customClaims, stripeId: stripeCustomer.id}
                    )

                    // // fulfill purchase
                    // await admin.firestore().doc(`users/${user.uid}`).set({
                    //     'updatedSubscription': subscription.current_period_start,
                    // });
                    uid = user.uid
                }
            )
        }
        // fulfill purchase
        await admin.firestore().doc(`users/${uid}`).set({
            'updatedSubscription': subscription.current_period_start,
        });

    }

    // Return a response to acknowledge receipt of the event
    response.json({received: true});
})


exports.declinePartnership = functions.https.onCall(async (data, context) => {
    if(!context.auth) return '[Error] no user'

    await admin.firestore().doc(`users/${context.auth.uid}`).set({
        'freePartner': Date.now(),
        'partnerSince': Date.now(),
    });

    return "success"
})

exports.createPartnerCheckout = functions.https.onCall(async (data, context) => {
    const unit_amount = Math.round(100 * data.price)
    if(!Number.isInteger(unit_amount) || unit_amount < 0) return '[Error] invalid price'

    if(!context.auth) return '[Error] no user'

    functions.logger.log("context.auth", context.auth)

    await cleanUserMetadata(context.auth)
    const user = admin.auth().getUser(context.auth.uid)
    let success_url = data.success_url || 'https://bythebookthebible.com'
    let cancel_url = data.cancel_url || 'https://bythebookthebible.com'
    // if(!url.origin.match(/https:\/\/.*bythebookthebible.com/i)) return '[Error] invalid url'

    const product = config.REACT_APP_STRIPE_PRODUCTS.partner
    const lookup_key = `partner-${unit_amount}`

    const existingPrices = await stripe.prices.list({
        product,
        lookup_keys: [lookup_key],
    });

    const price = existingPrices.data.length > 0
        ? existingPrices.data[0]
        : await stripe.prices.create({
            unit_amount,
            product,
            lookup_key,
            currency: 'usd',
            recurring: {interval: 'month'},
        });

    const line_items = [{price: price.id, quantity: 1}]

    const options = {
        payment_method_types: ['card'],
        metadata: {firebaseId: context.auth.uid},
        customer: (await user).customClaims.stripeId,
        mode: 'subscription',
        line_items,
        success_url,
        cancel_url,
    }
    const session = await stripe.checkout.sessions.create(options).catch(e => {
        functions.logger.error('Error Creating Stripe Session: ', JSON.stringify(e))
    })
    functions.logger.log({session})
    // store a db entry mapping session to uid
    // await admin.firestore().doc(`checkoutSessions/${session.id}`).set({...session, uid: context.auth.uid})
    await admin.firestore().doc(`users/${user.uid}`).set({
        'partnerSince': Date.now(),
    });

    return session.id
})

async function cleanUserMetadata(user) {
    user = user.token || user
    let claims = (await admin.auth().getUser(user.uid)).customClaims

    functions.logger.log("user", {user, claims})

    let userStatus = {uid: user.uid}
    let promises = []

    function verify(currentValue, correctValue, replaceFunction, logKey) {
        if(currentValue != correctValue) {
            userStatus[logKey] = {old: currentValue, new: correctValue}
            functions.logger.log(`updating ${logKey} from ${currentValue} to ${correctValue}`)

            const result = replaceFunction(correctValue)
            promises.push(result)
            return result
        }
    }


    let customer
    let stripeMatches = (await stripe.customers.list({email: user.email, limit: 3})).data

    userStatus.stripeMatches = stripeMatches.length
    if(stripeMatches.length > 1) {
        functions.logger.warn(`customer with duplicate emails in stripe ${user.email} ${stripeMatches.map(m=>m.id)}`)
    }

    // handle both > and == cases with stripeMatches[0]
    if(stripeMatches.length >= 1) {
        customer = stripeMatches[0]
        functions.logger.log(`matching user with existing stripe customer ${user.email} ${customer.id}`)

        // give stripe the firebaseId metadata
        verify(customer.metadata?.firebaseId, user.uid, firebaseId => 
            stripe.customers.update(customer.id, {metadata: {firebaseId}})
        , "firebaseIdInStripe")

        // give firebase the stripeId custom claim 
        verify(claims?.stripeId, customer.id, stripeId => 
            admin.auth().setCustomUserClaims(user.uid, {...claims, stripeId})
                .catch(functions.logger.error)
        , "stripeIdInFirebase")

    } else {
        functions.logger.log(`creating new stripe customer for ${user.email}`)
        // create stipe customer and sync stripe/firebase id
        customer = await stripe.customers.create({email: user.email, metadata: {firebaseId: user.uid}})
        await admin.auth().setCustomUserClaims(user.uid, {...claims, stripeId: customer.id})
            .catch(functions.logger.error);
    }

    // get metadata from stripe into firestore

    const partnerSince = customer.created
    const updatedSubscription = customer.subscriptions.total_count
        ? customer.subscriptions.data[0].current_period_start : false

    const userProfileDoc = admin.firestore().doc(`users/${user.uid}`)
    const userProfile = (await userProfileDoc.get()).data()

    verify(userProfile?.partnerSince, partnerSince, 
        partnerSince => userProfileDoc.set({partnerSince}), "partnerSince")

    verify(userProfile?.updatedSubscription, updatedSubscription, 
        updatedSubscription => userProfileDoc.set({updatedSubscription}), "updatedSubscription")

    await Promise.all(promises)
    return userStatus

    //     // if not connected to stripe
    //         // if matching stripe account(s), link them
    //         // if not, create new account

    //     // if connected to stripe
    //         // return subscription state [active, canceled, payment errors, duplicated subscription, no subscription]
    //         // make sure expiration claims match if active
}


// Go through all users and make sure that the 
// stripe & firebase state are well formed and consistent
exports.cleanAllUserMetadata = functions.https.onRequest(async (request, response) => {
    let firebaseUsers = (await admin.auth().listUsers()).users

    let userResults = await Promise.all(
        firebaseUsers.map(user => cleanUserMetadata(user))
    )

    functions.logger.log({userResults})
    response.json({userResults});
})
