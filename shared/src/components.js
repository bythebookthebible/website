import React from 'react';
import { useAuth } from "./firebase"
import logoSpinning from '../assets/logoSpinning.svg'
import LoginSignup from './Login/LoginSignup';

export * from './Login/ManageAccount';
export * from "./Login/User";
export * from "./Media/Media";
export * from "./Media/DBResouceContext"

export function Spinner(props) {
  return <img src={logoSpinning} {...props} />
}

export function LoadingPage(props) {
  return <div style={{textAlign:'center'}} >
    {props.title && <h4>{props.title}</h4> }
    {props.description && <p>{props.description}</p> }
    <Spinner style={{width:'80%', maxWidth:'500px', margin:'20% auto'}} />
  </div>
}

export function AbsoluteCentered(props) {
  const child = React.Children.only(props.children)
  return React.cloneElement(props.children, {style:{
    position: 'absolute',
    margin: 0,
    top: '50%',
    left: '50%',
    transform: 'translateY(-50%) translateX(-50%)',
    ...child.props.style,
    ...props.style,
    }})
}

export const ErrorMsg = props => <div className='text-center p-5'>
  <img src='https://www.biblestudytools.com/Content/Images/file-not-found.jpg' className='mw-100' />
  <h3>
    Oops, we broke something...<br />
    Try <a href='/'>refreshing the page</a>
    or email <a href='mailto:rose@bythebookthebible.com'>rose@bythebookthebible.com</a>
  </h3>
</div>


export function AuthSwitch(props) {
  // const rehydrated = useSelector(state => state._persist.rehydrated)
  let user = useAuth()
  console.log({user})

  // login / loading cases
  if(!user) return <LoginSignup /> // not logged in
  if(!user.profile) return <LoadingPage title="Loading Profile..."/> // loading profile (and claims)
  // if(!user.online) return props.children // offline mode assumes you have a valid account
  if(!(user.profile.updatedSubscription || user.profile.freePartner)) return <Subscribe />
  return props.children 

  // if(!user.claims?.stripeId) {
  //   // account is not initialized yet on the back end
  //   // let firebase initialize (wait or trigger)
  //   return <LoadingPage title="Preparing Account..."/>
  // }
  // if(user.claims.admin || user.claims.permanentAccess || user.claims.expirationDate - Date.now() > 0) {
  //   return props.children // logged in successfully
  // }

  // check stripe status:
  // if there is no subscription (and we already checked the trial is expired)
  // return <Subscribe />
  // if there is a subscription that has been canceled or has an error or something, prompt accordingly
}
