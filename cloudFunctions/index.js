// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
require('firebase-admin/auth');
require('firebase-admin/firestore');
require('firebase-admin/storage');
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
  //   displayName: "Name", email: "test@example.com", phoneNumber: null, photoURL: null,
  //   providerId: "password", uid: "test@example.com", tenantId: null
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
          //   'updatedSubscription': subscription.current_period_start,
          // });
          uid = user.uid
        }
      )
    }

    // fulfill purchase
    await admin.firestore().doc(`users/${uid}`).set({
      'updatedSubscription': subscription.current_period_start,
    });

    const userData = (await admin.firestore().doc(`users/${uid}`).get()).data()
    if(!userData.partnerSince) {
      await admin.firestore().doc(`users/${uid}`).set({
        'partnerSince': subscription.created,
      });
    }
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
  const quantity = Math.round(data.price)
  if(!Number.isInteger(quantity) || quantity < 0) return '[Error] invalid price'

  if(!context.auth) return '[Error] no user'

  functions.logger.log("context.auth", context.auth)

  await cleanUserMetadata(context.auth)
  const user = admin.auth().getUser(context.auth.uid)
  let success_url = data.success_url || 'https://bythebookthebible.com'
  let cancel_url = data.cancel_url || 'https://bythebookthebible.com'
  // if(!url.origin.match(/https:\/\/.*bythebookthebible.com/i)) return '[Error] invalid url'

  // const product = config.REACT_APP_STRIPE.partnerProductId
  const priceId = config.REACT_APP_STRIPE.partnerPriceId

  functions.logger.log("Price ID: " + priceId)

  const price = await stripe.prices.retrieve(priceId).catch(functions.logger)

  functions.logger.log("price", {price})

  const options = {
    payment_method_types: ['card'],
    metadata: {firebaseId: context.auth.uid},
    customer: (await user).customClaims.stripeId,
    mode: 'subscription',
    line_items: [
      {price: priceId, quantity}
    ],
    success_url,
    cancel_url,
  }

  functions.logger.log("checkout options", options)

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

  //   // if not connected to stripe
  //     // if matching stripe account(s), link them
  //     // if not, create new account

  //   // if connected to stripe
  //     // return subscription state [active, canceled, payment errors, duplicated subscription, no subscription]
  //     // make sure expiration claims match if active
}


exports.getPartnershipStatus = functions.https.onCall(async (data, context) => {
  // validate auth & get (or make?) user's stripe ID
  if(!context.auth) return 'Error: no user'
  const user = admin.auth().getUser(context.auth.uid)
  functions.logger.log("user", {user})

  const claims = (await user).customClaims
  if(!claims?.stripeId) return [] // no stripeId means no matches
  const stripeId = claims.stripeId

  // potentially clean clean up if stripe id is inconsistent
  // await cleanUserMetadata(context.auth)

  // fetch subscription data from Stripe API
  const customer = await stripe.customers.retrieve(stripeId)
  functions.logger.log("customer", {customer})

  // // do we want to add some of this data into our response?
  // await admin.firestore().doc(`users/${user.uid}`).set({
  //   'partnerSince': Date.now(),
  // });

  // potentially simplify data before we return
  return customer.subscriptions.data
})

exports.createBillingManagementSession = functions.https.onCall(async (data, context) => {
  // validate auth & get (or make?) user's stripe ID
  if(!context.auth) return '[Error] no user'
  const user = admin.auth().getUser(context.auth.uid)
  functions.logger.log("user", {user})

  // currently dont validate this stripeId
  const stripeId = (await user).customClaims.stripeId

  let return_url = data.return_url || 'https://bythebookthebible.com'
  // if(!url.origin.match(/https:\/\/.*bythebookthebible.com/i)) return '[Error] invalid url'

  // create billingPortal session
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeId,
    return_url,
  });

  return session
})


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


exports.serveVideoDirectory = functions.https.onRequest(async (request, response) => {
  const videoDirectoryPage = (await admin.firestore().doc("webCache/videoDirectory").get()).data()
  functions.logger.log({videoDirectoryPage})
  response.status(200).send(videoDirectoryPage.html)
})


exports.updateVideoDirectoryCache = functions.firestore.document("memoryResources/{docId}")
.onWrite(async (change, context) => {
  // id is stored at context.params.docId
  if(change.before.data()?.location === change.after.data()?.location) {
    return // noop
  }

  // if there is a change, generate a fresh thing from scratch
  const memoryResourcesDB = 'memoryResources'
  const snap = await admin.firestore().collection(memoryResourcesDB).get()
  let resources = {}
  snap.forEach(d => { resources[d.id] = d.data() })


  // these come presorted by UID which is also in the Bible's order
  const schmideos = objectFilter(resources, (k,v) => v.series === 'Schmideo' || v.series === 'Music')
  functions.logger.log({schmideos})

  // whatever api call is with getDownloadURL, I want to do it in parallel (maybe network?)
  const bucket = admin.storage().app.options.storageBucket;

  const withUrls = await Promise.all(Object.entries(schmideos).map(async ([k,v],i) => {
    const {book, chapter, verses} = scriptureFromKey(v.module)

    const exists = await admin.storage().bucket().file(v.location).exists();
    const url = !exists ? '' : `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(v.location)}?alt=media`

    return {...v, book, chapter, verses, url}
  }))
  withUrls.filter(s=>s.url != '')
  functions.logger.log({withUrls})

  // convert the data structure into what I will display
  const items = withUrls.reduce((items, newItem) => {
    const {book, chapter, verses, url, module, series} = newItem

    items[book] = items[book] || {}

    items[book][module] = items[book][module]
    || {book, chapter, verses, module}

    items[book][module][series] = url

    return items
  }, {})

  // add elements to root for each schmideo
  let table = []

  for(const book in items) {
    // insert a title for each new book
    table.push(`\n  <h2>${book}</h2>`)

    for(const module in items[book]) {
      const {chapter, verses, Music, Schmideo} = items[book][module]

      // insert a link for each video
      const title = `<div>${book} ${chapter}:${verses}</div>`
      const musicLink = Music ? `<a href="${Music}" download>Download Audio Only</a>` : '<div></div>'
      const schmideoLink = Schmideo ? `<a href="${Schmideo}" download>Download Schmideo</a>` : '<div></div>'
      table.push(`  <div class="grid-3">${title} ${schmideoLink} ${musicLink}</div>`)
    }
  }

  const videoDirectoryPage = `<!DOCTYPE html>
<html>

<head>
  <title>By the Book Video Directory</title>
  <meta name="description" content="Easily Memorize Books of the Bible" />

  <meta charset="utf-8" />
  <link rel="icon" href="../public/logo.png" type="image/png"/>
  <link rel="apple-touch-icon" href="../public/logo.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#28B7FF" />

  <style>
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 1px 2rem;
  }
  .grid-3:nth-of-type(odd) {
    background-color: #eeeeff;
  }
  .grid-3:nth-of-type(even) {
    background-color: #f8f8f8;
  }
  h1,h2,h3,h4,h5 {
    margin: 2rem 0 0;
  }
  h2 {
    border-bottom: 2px solid #005697;
  }
  .container {
    padding: 2rem;
    margin: auto;
    max-width: 40rem;
  }

  @import url('https://fonts.cdnfonts.com/css/athelas');

  body {
    color: #005697;
    font-family: "Athelas", 'Times New Roman', Times, serif;
  }
  
  a,a:visited {
    color: #005697;
  }
  a:hover {
    color: #7dbbea;
  }
  </style>
</head>

<body>
<div id="root" class="container">
  <h1>By the Book Memory Directory</h1>
  <p>This is a Directory of all the memory tracks which we have uploaded. 
  </p><p>If you want to try our other Memorization tools, you can check out all of our other <a href="https://vimeo.com/user192089924/albums">memory platforms</a>.
  </p>
  ${table.join("\n")}
</div>
</body>
</html>` 

  admin.firestore().doc("webCache/videoDirectory").set({html: videoDirectoryPage})
})



////////////// Utility Functions ////////////////

const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea',
'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
'1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
'1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']

const keyFromScripture = (book, chapter, verses) => {
  if(chapter) {
  if(verses) {
    // all exist
    let [startVerse, endVerse] = verses.split('-')
    return `${String(books.indexOf(book)).padStart(2,'0')}-${String(chapter).padStart(3,'0')}-${String(startVerse).padStart(3,'0')}-${String(endVerse).padStart(3,'0')}`
  }
  // book, chap, no verses
  return `${String(books.indexOf(book)).padStart(2,'0')}-${String(chapter).padStart(3,'0')}`
  }
  // only book
  return `${String(books.indexOf(book)).padStart(2,'0')}`
}

const scriptureFromKey = key => {
  let r = key.split('-')
  if(r.length == 4) {
  return {book: books[Number(r[0])], chapter: Number(r[1]), verses: `${Number(r[2])}-${Number(r[3])}`}
  }
  if(r.length == 2) {
  return {book: books[Number(r[0])], chapter: Number(r[1])}
  }
  if(r.length == 1) {
  return {book: books[Number(r[0])]}
  }
}

function friendlyScriptureRef(key) {
  let s = scriptureFromKey(key)
  let ref = s.book
  if(s.chapter) ref += ' ' + s.chapter
  if(s.verses) ref += ':' + s.verses
  return ref
}

const objectMap = (obj, fn) =>
  Object.fromEntries(
  Object.entries(obj).map(
    ([k, v], i) => fn(k, v, i)
  )
  )

const objectFilter = (obj, fn) =>
  Object.fromEntries(
  Object.entries(obj).filter(
    ([k, v]) => fn(k, v)
  )
  )

