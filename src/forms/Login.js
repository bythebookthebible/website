import React, { useState, useRef} from 'react';
import { Modal, Container, Row, Col, Card } from 'react-bootstrap';
import $ from 'jquery'

import {firebase, db, storage} from '../firebase'
var auth = firebase.auth()
// var firebaseui = require('firebaseui');

const tosUrl = '/termsOfService'
const privacyPolicyUrl = '/privacy'

var userDataMigration = firebase.functions().httpsCallable('userDataMigration');

export var Login = {
    LoginButton: LoginButton,
    LogInOutButton: LogInOutButton,
    TermsOfService: TermsOfService,
    PrivacyPolicy: PrivacyPolicy,
    LoginFrom: LoginForm,
    AuthSwitch: AuthSwitch,
}

function LogInOutButton(props) {
    let user = props.user

    if(user) {
        return <div className="btn btn-round btn-primary" onClick={() => {
                auth.signOut().then(function(user) {
                    }).catch(function(e) {
                        console.log('Signout error: ', e);
                    });
            }}>Logout</div>
    } else {
        return <LoginButton className="btn-secondary" />
    }
}

function LoginButton(props) {
    const [show, setShow] = useState(false);

    return <>
        <button {...props} className="btn btn-round btn-primary" onClick={() => setShow(true)}>Login</button>
        <Modal onHide={() => setShow(false)} show={show} size="sm" aria-labelledby="authTitle" centered>
            <LoginForm {...props} onCancel={()=>setShow(false)} />
        </Modal>
    </>
}

// requires withAuth
function AuthSwitch(props) {
    let {user, tests, ...passThru} = props
    if(!user) {
        return <LoginForm className='mt-5 mx-auto' user={user} {...passThru} />
    }
    for(let {test, value} of tests) {
        if(test(user)) return React.cloneElement(value, {user, ...passThru})
    }
    return React.cloneElement(props.default || props.children, {user, ...passThru})
}

function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

function LoginForm(props) {
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [action, setAction] = useState('signin')

    const emailRef = useRef()
    const pwdRef = useRef()
    const nameRef = useRef()

    function error(e) {
        let msg = e.message || e
        // Change some error messages
        if(e.code === 'auth/wrong-password') msg = 'Invalid Password.'
        console.log(e);
        setErrorMessage(msg);
    }

    // checks the email to change between signin and signup
    // returns true if the action was changed
    async function checkEmail(email) {
        if(validEmail(email)) {
            let methods = await auth.fetchSignInMethodsForEmail(email)        
            let newAction = methods.length == 0 ? 'create' : 'signin'
    
            if(newAction != action) {
                setAction(newAction)
                return true
            }
        }
        return false
    }

    async function createAccount() {
        let email = emailRef.current.value
        let password = pwdRef.current.value
        let name = nameRef.current.value

        // validate input
        if(!validEmail(email))
            error("Please enter a valid email.")
        else if (password.length === 0)
            error("Please enter password.")
        else if (name.length === 0)
            error("Please enter your name.")
        else {
            // console.log('create account', email, name, password.replaceAll(/./g, '*'))

            await auth.createUserWithEmailAndPassword(email, password).catch(error)
            await firebase.auth().currentUser.updateProfile({displayName: name}).catch(error)
            window.location.reload()
        }
    }

    async function signIn() {
        let email = emailRef.current.value
        let password = pwdRef.current.value

        // console.log('sign in', email, password.replaceAll(/./g, '*'))

        auth.signInWithEmailAndPassword(email, password)
            .then(props.onSubmit)
            .catch(e => {
                setShowResetPassword(true)
                error(e)
            })

        userDataMigration()
            .then(changed=>{
                console.log('migration', changed.data)
            })
            .catch(e=>console.log('migration', e))

    }

    let submitForm = e=>{
        e.preventDefault()

        let submit = async ()=>{
            // if the action has changed on this submit (ex: auto-submit), cancel submit and let form update
            let email = emailRef.current.value
            if(await checkEmail(email)) return
            
            if(action=='signin') await signIn()
            else await createAccount()
        }
        submit()        
    }
    
    let title = 'Sign In / Create Account' // action=='signin' ? 'Sign In' : 'Create Account'

    return <Card {...props} className={'small-card '+(props.className||'')} >
        <Card.Title as='h3' className='mt-3 text-center'>
            {title}
        </Card.Title>
        <hr/>
        <Card.Body as='form' onSubmit={submitForm}>
            <Card.Text>
                {action=='create' && <input type="text" className="form-control" name='name' ref={nameRef} placeholder="Name"/>}
                <input type="email" className="form-control" name='email' ref={emailRef} placeholder="Email" onBlur={e => checkEmail(e.target.value)} />
                <input type="password" className="form-control" name='password' ref={pwdRef} placeholder="Password" />
            </Card.Text>
            <Card.Text as='div'>
                <div className="d-flex flex-centered">
                    <button type="button" className="btn btn-round btn-secondary m-1" onClick={props.onCancel} >Cancel</button>
                    <button type="submit" className="btn btn-round btn-primary m-1" id="submitAuth" onClick={submitForm}>Submit</button>
                </div>
                <div id="error-message" className="text-danger py-2">{errorMessage}</div>
            </Card.Text>
            {showResetPassword && <Card.Text id="resetPassword" className="p-1 text-center">
                Having Trouble?
                <a href="" className="mx-1" onClick={() =>
                    auth.sendPasswordResetPassword($("#email").val()).catch(error) // TODO set better response message
                }>Reset Password</a>
            </Card.Text>}
        </Card.Body>
        <Card.Footer >
            <a href={tosUrl} className="p-1">Terms of Service</a>
            &#x27E1; {/* Diamond */}
            <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
        </Card.Footer>
    </Card>
}

function TermsOfService(props) {
    return (
    <div className="container-xl" >
        <h1>-- By The Book The Bible - Terms of Service / Use --</h1>
        <h2>Terms of Use (the short, but not legal, version):</h2>
        <p>This subscription is for everyone in your household on any device your family uses for as long as your license is in good standing.</p>
        <p>You may print the material for your family’s use.</p>
        <p>Please encourage your friends to subscribe - but do not share your credentials.</p>
        <p>You are not allowed to copy, distribute or resell any of the contents.</p>
        <p>Things should work, but if they don’t - we’re sorry and you can’t sue us.</p>
        <p>You may cancel your subscription any time - but sorry no refunds.</p>
        <p>If you share comments, videos, or photos with us we can use them unless you ask us not to.</p>
        <p>If you want to use this for a larger group (church, VBS, etc) or if you have any other questions, please contact <a href='mailto:rose@bythebookthebible.com'>rose@bythebookthebible.com</a></p>
        
        <h2>Terms of Use (the legal version):</h2>
        <h2>Please read this it is what you are agreeing to.</h2>
        <p>Welcome to memorize.bythebookthebible.com (the “Site”, referred to as “we,” “us” or “our” ). Use of and access to the services provided by ByTheBookTheBible (the “Company”), as well as the Site, is subject to your compliance with these Terms of Use. Please read these Terms of Use carefully before using our Site and services (collectively referred to as the “Services”).</p>
        <p>ByTheBookTheBible reserves the right to limit or terminate your access to our Services if we determine in our sole discretion that you have failed to comply with these Terms of Use. Please also read our Privacy Policy before accessing our Services, which can be located here.</p>
        
        <h2>1. ACCEPTANCE OF TERMS</h2>
        <p>You accept these terms and our Privacy Policy by accessing or using the Site or our Services in any manner, even if you do not create an account with ByTheBookTheBible. These Terms may be updated from time to time. We will notify you of any significant updates to these Terms at our sole discretion. Your continued use of our Services signifies your acceptance of any changes. These Terms will always be available on this page for you to read. If you do not agree with these Terms, you are not permitted to register an account, sign in, make purchases, or otherwise access or use the Site or our Services in any manner. By accessing and using the Site in any way, you are representing that you are at least 18 years of age or visiting the Site under the supervision of a parent or guardian.</p>
        
        <h2>2. AGE RESTRICTION</h2>
        <p>You must be at least 18 years old in order to sign up to this Site. ByTheBookTheBible prohibits registration by any individual under the age of 18 years old. If you are a parent or guardian and believe that a child under the age of 13 has used, accessed, or provided personally identifiable information to the Site, please let us know.</p>
        
        <h2>3. USE OF SITE</h2>
        <p>Subject to the terms and conditions of this Agreement, you are permitted to access and use this Site by displaying it on your Internet browser for use within your household. You may not use this Site for any commercial use or on behalf of any third party, and you agree not to copy, modify, display, publish, distribute, broadcast, or distribute any portion of the Site without express written consent from ByTheBookTheBible.  </p>
        <p>You are permitted to print out the PDF material (for example, the Teachers Guide and Coloring Pages) for your households use.</p>
        <p>While we do our best to make your experience with the Site and our Services a pleasurable one, we cannot always foresee or anticipate difficulties, technical or otherwise. These difficulties may result in loss of data, personalization settings, or other service interruptions. For this reason, you agree that ByTheBookTheBible Services are provided “AS IS.” ByTheBookTheBible and any third-party service providers cannot assume responsibility for the timeliness, deletion, mis-delivery, or failure to store any user data, communications, or personalization settings. We reserve the right to change or discontinue, temporarily or permanently, the Site or the Service at any time without notice. You agree that ByTheBookTheBible will not be liable to you or any third party for any modification, interruption, or discontinuation of the Service.</p>
        <p>It is our intention, however, to make all videos and related items listed as long as your subscription is in good standing.  It is also our intention that should such changes be necessary, ByTheBookTheBible will endeavor to reach all enrolled families by email to advise them of such changes.</p>
        
        <h2>4. ByTheBookTheBible ACCOUNT</h2>
        <p>By using the Site and/or Services, or creating an account with ByTheBookTheBible (an “Account”), you agree to provide true and correct information to the best of your ability whenever prompted by the Service to provide information or when otherwise requested by us. You further agree that you will not knowingly omit or misrepresent any material facts or information and that you will revise any incorrect or outdated information by updating your Account information or otherwise providing notice to ByTheBookTheBible.</p>
        <p>You agree that your Account will be for your household’s exclusive personal use and that you will not allow any other person or family to use your Account under any circumstances. You understand that it is your sole responsibility to maintain the confidentiality of your Account ID and password and that ByTheBookTheBible will not be responsible for any damage, loss, or liability incurred as a result of your failure to do so. You also understand that you are solely responsible for any activity occurring on your Account, including any charges made to your Account. You agree to immediately notify ByTheBookTheBible if there has been any unauthorized activity on your Account or if you suspect that there has been a breach of security of your Account.</p>
        <p>You represent and warrant that you will not use the Site for illegal purposes or for the transmission of material that is unlawful, harassing, libelous (untrue and damaging to others), invasive of another’s privacy, abusive, threatening, obscene, and/or illegal, and/or infringes the copyrights (right of an owner of written material) or other intellectual property of others.</p>
        <p>We reserve the right to terminate your Account at any time if you violate these Terms of Use or the Company’s Privacy Policy, or for any other reason as determined by the Company in its sole discretion.</p>
        
        <h2>5. PURCHASE OF PRODUCTS</h2>
        <p>ByTheBookTheBible offers certain products for sale on the Site (“Products”). All prices displayed on the Site are quoted in U.S. Dollars. We reserve the right without prior notice to discontinue or change specifications on Products and services offered on the Site without incurring any obligations.</p>
        <p>In order to purchase our Products, you will be required to enter a valid credit card. By providing a credit card associated with an Account, you are hereby authorizing the Company to charge your credit card for all costs associated with your purchase.</p>
        <p>We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household, or per order. These restrictions may include orders placed by or under the Account, the same credit card, and orders that use the same billing or shipping address. If we make a change to or cancel an order, we will attempt to notify you by contacting you through the email, phone number, or address provided at the time of purchase.</p>
        <p>You understand and agree that you are prohibited from reselling or redistributing any ByTheBookTheBible products in any manner. We reserve the right to limit or prohibit orders that, in our sole judgment, appear to be placed by dealers, resellers, or distributors.</p>
        
        <h2>6. REFUND POLICY</h2>
        <p>You may stop your subscription at any time, however there are no refunds unless the Service or platform is offline for a significant part of the billing cycle.</p>
        
        <h2>7. INTELLECTUAL PROPERTY</h2>
        <p>All information, products, services, graphics, icons, images, articles, software, and other materials, and the display, design, arrangement, and assembly of those materials (collectively “Content”) appearing on the Site are the exclusive property of ByTheBookTheBible and/or its affiliates. The Content is protected by U. S. and international copyright laws. The publication, sale, or redistribution in any form or medium of the Content is strictly prohibited without prior written permission of ByTheBookTheBible. Content that is publicly available on the Site may not be stored in a computer, except for personal and non-commercial use.</p>
        <p>All trademarks, logos, trade dress, and service marks (collectively “Trademarks”) displayed on the Site are the exclusive property of ByTheBookTheBible. The use of our Trademarks without express written authorization is strictly prohibited. You may not use, display, or publish our Trademarks for commercial purposes, in any way that would cause confusion among consumers, or in any manner that would disparage, discredit, or otherwise harm the reputation of ByTheBookTheBible.</p>
        
        <h2>8. PRIVACY POLICY</h2>
        <p>ByTheBookTheBible respects your privacy. Our Privacy Policy can be located here.</p>
        <p>By using the Site and our Service, you are consenting to the terms of our Privacy Policy.  We may from time to time send you e-mails but will not share your e-mail with external folks without your permission.</p>
        
        <h2>8b. PHOTO &amp; VIDEO RELEASE: </h2>
        <p>I hereby give permission to ByTheBookTheBible and any of its employees, contractors, or representatives to use my FIRST name, City, State along with my comments,  videos and photos that I post online or share in e-mail to use in any form and media for advertising, exposition displays, trade, and any other lawful purposes.  However, if I do NOT want this information posted or used by ByTheBookTheBible, I will clearly state in my e-mail “NOT FOR PUBLIC RELEASE”. </p>
        
        <h2>9. WARRANTY DISCLAIMER &amp; LIMITATION OF LIABILITY</h2>
        <p>EXCEPT AS OTHERWISE EXPLICITLY STATED IN THE TERMS OF SALE THAT GOVERN THE SALE OF EACH PRODUCT ON THE SITE, THE PRODUCTS OFFERED FOR SALE AND THE TRANSACTIONS CONDUCTED THROUGH THE SITE ARE PROVIDED ON AN “AS IS” BASIS. ByTheBookTheBible MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND AS TO THE OPERATION OF THE SITE OR THE INFORMATION, CONTENT, MATERIALS, OR PRODUCTS INCLUDED OR SOLD ON THIS SITE, EXCEPT AS EXPRESSLY STATED OTHERWISE. ByTheBookTheBible HEREBY DISCLAIMS ALL WARRANTIES EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, TITLE, AND QUIET ENJOYMENT.</p>
        <p>EXCEPT AS EXPRESSLY PROVIDED OTHERWISE, YOU ASSUME ALL RISKS CONCERNING THE SUITABILITY AND ACCURACY OF THE INFORMATION ON THE SITE. THE SITE MAY CONTAIN TECHNICAL INACCURACIES OR TYPOGRAPHICAL ERRORS. ByTheBookTheBible ASSUMES NO RESPONSIBILITY FOR AND DISCLAIMS ALL LIABILITY FOR ANY SUCH INACCURACIES, ERRORS, OR OMISSIONS ON THE SITE. ByTheBookTheBible CANNOT GUARANTEE THAT ANY PERSONAL INFORMATION SUPPLIED BY YOU WILL NOT BE MISAPPROPRIATED, INTERCEPTED, OR USED BY OTHERS.</p>
        <p>TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT WILL ByTheBookTheBible BE LIABLE FOR ANY SPECIAL, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA, OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF, OR IN CONNECTION WITH, THE USE OF THE COMPANY’S SERVICE.</p>
        
        <h2>10. LINKS TO THIRD PARTY WEBSITES</h2>
        <p>This Site might contain links to third-party websites which are not under the control of ByTheBookTheBible.  ByTheBookTheBible is not responsible for the contents of any linked site or any link contained in a linked site, or any changes or updates to such sites. ByTheBookTheBible is providing these links to you only as a convenience, and the inclusion of any link does not imply that ByTheBookTheBible endorses or accepts any responsibility for the content on such third-party site.</p>
        
        <h2>11. RELEASE AND INDEMNIFICATION BY USERS</h2>
        <p>You agree to forever release, indemnify, defend, and hold harmless ByTheBookTheBible, its directors, affiliates, officers, subsidiaries, employees, agents, licensors, attorneys, independent contractors, and providers from and against any and all claim, loss, expense, or demand of liability, including attorneys’ fees and costs, arising out of your use or inability to use the Services. ByTheBookTheBible reserves the right, at its own expense, to assume the exclusive defense and control of any matter otherwise subject to your indemnification. You agree not to settle any claim or matter without the written consent of the Company.</p>
        
        <h2>12. ARBITRATION</h2>
        <p>Please read this carefully. It affects your rights. ByTheBookTheBible and you (such references include our respective subsidiaries, affiliates, predecessors in interest, successors and assigns) agree to arbitrate all disputes and claims arising out of or relating to this Agreement between ByTheBookTheBible and you.</p>
        <p>A party who intends to seek arbitration must first send written notice to ByTheBookTheBible of its intent to arbitrate (“Notice”). The Notice to ByTheBookTheBible should be sent by any of the following means:  electronic message by sending an email to <a href='mailto:support@bythebookthebible.com'>support@bythebookthebible.com</a>. The Notice must (a) describe the nature and basis of the claim or dispute, and (b) set forth the specific relief sought. If we do not reach an agreement to resolve the claim within 30 days after the Notice is received, you or ByTheBookTheBible may commence an arbitration proceeding.</p>
        <p>The arbitration shall be governed by the Commercial Dispute Resolution Procedures and the Supplementary Procedures for Consumer Related Disputes (collectively, “AAA Rules”) of the American Arbitration Association (“AAA”), as modified by this Agreement, and shall be administered by the AAA. All issues are for the arbitrator to decide, including the scope of this arbitration clause, but the arbitrator is bound by the terms of this Agreement.</p>
        <p>You agree that, by entering into this Agreement, you and ByTheBookTheBible are waiving the right to a trial by jury.</p>
        <p>The arbitrator may award injunctive relief only in favor of the individual party seeking relief and only to the extent necessary to provide relief warranted by that party’s individual claim. You and ByTheBookTheBible agree that YOU AND ByTheBookTheBible MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, and not as a plaintiff or class member in any purported class or representative proceeding. Further, you agree that the arbitrator may not consolidate proceedings or more than one person’s claims, and may not otherwise preside over any form of a representative or class proceeding and that if this specific proviso is found to be unenforceable, then the entirety of this arbitration clause shall be null and void.</p>
        
        <h2>13. MODIFICATIONS TO TERMS OF USE.</h2>
        <p>ByTheBookTheBible may change, modify, update, add or remove portions of these Terms of Use at any time. Please review these Terms of Use periodically for changes. Your continued use of the Company’s Service following the posting of any changes will signify your acceptance of those changes.</p>
        
        <h2>14. MISCELLANEOUS.</h2>
        <p>These Terms of Use constitute the entire agreement between you and ByTheBookTheBible regarding this subject matter and govern your use of the Site. By accessing the Site, you agree that the statutes and laws of the United States and the State of Washington, without regard to any principles of conflicts of law, will apply to all matters relating to the use of this Site and use of ByTheBookTheBible.</p>
        <p>The failure of ByTheBookTheBible to exercise or enforce any right or provision of these Terms of Use does not constitute a waiver of such right or provision. If a court of competent jurisdiction finds any provision of these Terms of Use to be invalid, the parties nevertheless agree that the court should endeavor to give effect to the parties’ intentions as reflected in the provision, and the other provisions of these Terms of Use remain in full force and effect. Regardless of any statute or law to the contrary, any claim or cause of action arising out of or related to use of the Site or these Terms of Use must be filed within one (1) year after such claim or cause of action arose or be forever barred. The section titles in these Terms of Use are for convenience only and have no legal or contractual effect.</p>
        <p>If you read this far - congratulations!  You deserve something nice - a cup of tea or chocolate?</p>
    </div>
    )
}

function PrivacyPolicy(props) {
    return (
    <div className="container-xl" >
        <h1>-- By The Book The Bible Privacy --</h1>
        <h2>1. What information do we collect and what do we do with it?</h2>
        <p>When you enroll as a student or subscriber (“learner”) on our site or related courses, as part of the enrolling process, we collect the personal information you give us such as your name and email address.</p>
        <p>Email marketing: we may send you emails about our site and related course(s), registration, course content, your course progress or other updates. We may also use your email to inform you about changes to the course, survey you about your usage, or collect your opinion.</p>

        <h2>2. How do you get my consent?</h2>
        <p>When you provide us with personal information to become a learner on our site, make a purchase, or participate in the course, you imply that you consent to our collecting it and using it for that specific reason only.</p>
        <p>If we ask for your personal information for a secondary reason, like marketing, we will either ask you directly for your expressed consent, or provide you with an opportunity to say no.</p>
        <p>How do I withdraw my consent?</p>
        <p>If after you opt-in, you change your mind, you may withdraw your consent for us to contact you, for the continued collection, use or disclosure of your information, at anytime, by contacting us at <a href='mailto:support@bythebookthebible.com'>support@bythebookthebible.com</a>.</p>

        <h2>3. Disclosure</h2>
        <p>We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service </p>

        <h2>4. Thinkific</h2>
        <p>Our course and site is hosted by Thinkific Labs Inc. (“Thinkific”). They provide us with the online course creation platform that allow us to sell our product/services to you.</p>
        <p>Your data is stored through Thinkific’s data storage, databases and the general Thinkific application. They store your data on a secure server behind a firewall.</p>

        <h2>5. Payment:</h2>
        <p>If you make a purchase on our site, we use a third party payment processor such as Stripe or Paypal. Payments are encrypted through the Payment Card Industry Data Security Standard (PCI-DSS). Your purchase transaction data is stored only as long as is necessary to complete your purchase transaction.</p>
        <p>All direct payment gateways adhere to the standards set by PCI-DSS as managed by the PCI Security Standards Council, which is a joint effort of brands like Visa, MasterCard, American Express and Discover.</p>
        <p>PCI-DSS requirements help ensure the secure handling of credit card information by our site and related courses and its service providers.</p>
        <p>For more insight, you may also want to read Thinkific’s Terms of Service here https://www.thinkific.com/resources/privacy-policy/ or Privacy Statement here https://www.thinkific.com/resources/terms-of-service/ </p>

        <h2>6. Third Party Services</h2>
        <p>In general, the third-party providers used by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.</p>
        <p>However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions.</p>
        <p>For these providers, we recommend that you read their privacy policies so you can understand the manner in which your personal information will be handled by these providers.</p>
        <p>Certain providers may be located in or have facilities that are located in a different jurisdiction than either you or us. If you elect to proceed with a transaction that involves the services of a third-party service provider, then your information may become subject to the laws of the jurisdiction(s) in which that service provider or its facilities are located.</p>
        <p>As an example, if you are located in Canada and your transaction is processed by a payment gateway located in the United States, then your personal information used in completing that transaction may be subject to disclosure under United States legislation, including the Patriot Act.</p>
        <p>Once you leave our course website or are redirected to a third-party website or application, you are no longer governed by this Privacy Policy or our website’s Terms of Service.</p>
        <p>Links - When you click on links on our course site, they may direct you away from our site. We are not responsible for the privacy practices of other sites and encourage you to read their privacy statements.</p>

        <h2>7. Security</h2>
        <p>To protect your personal information, we take reasonable precautions and follow industry best practices to make sure it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.</p>
        <p>If you provide us with your credit card information, the information is encrypted using secure socket layer technology (SSL) and stored with a AES-256 encryption.  Although no method of transmission over the Internet or electronic storage is 100% secure, we follow all PCI-DSS requirements and implement additional generally accepted industry standards.</p>

        <h2>8. Cookies</h2>
        <p>We collect cookies or similar tracking technologies. This means information that our website’s server transfers to your computer. This information can be used to track your session on our website. Cookies may also be used to customize our website content for you as an individual. If you are using one of the common Internet web browsers, you can set up your browser to either let you know when you receive a cookie or to deny cookie access to your computer.</p>
        <p>We use cookies to recognize your device and provide you with a personalized experience.</p>
        <p>We also use cookies to attribute visits to our websites to third-party sources and to serve targeted ads from Google, Facebook, Instagram and other third-party vendors.</p>
        <p>Our third-party advertisers use cookies to track your prior visits to our websites and elsewhere on the Internet in order to serve you targeted ads. For more information about targeted or behavioral advertising, please visit https://www.networkadvertising.org/understanding-online-advertising.</p>
        <p>Opting out: You can opt out of targeted ads served via specific third-party vendors by visiting the Digital Advertising Alliance’s Opt-Out page.</p>
        <p>We may also use automated tracking methods on our websites, in communications with you, and in our products and services, to measure performance and engagement.</p>
        <p>Please note that because there is no consistent industry understanding of how to respond to “Do Not Track” signals, we do not alter our data collection and usage practices when we detect such a signal from your browser.</p>

        <h2>9. Web Analysis Tools</h2>
        <p>We may use web analysis tools that are built into the BUSINESS NAME website to measure and collect anonymous session information.</p>

        <h2>10. Age of Consent</h2>
        <p>By using this site, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence.</p>

        <h2>11. Changes to this Privacy Policy</h2>
        <p>We reserve the right to modify this privacy policy at any time, so please review it frequently. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you here that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.</p>
        <p>If our site or course is acquired or merged with another company, your information may be transferred to the new owners so that we may continue to sell products to you.</p>

        <h2>12. QUESTIONS AND CONTACT INFORMATION</h2>
        <p>If you would like to: access, correct, amend or delete any personal information we have about you, register a complaint, or simply want more information contact us at <a href='mailto:support@bythebookthebible.com'>support@bythebookthebible.com</a>.</p>
    </div>
    )
}