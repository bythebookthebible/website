import './login.scss';

import { auth } from '../firebase'
import { fetchSignInMethodsForEmail } from "firebase/auth"

export function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export async function accountExists(email) {
    if(validEmail(email)) {
        let methods = await fetchSignInMethodsForEmail(auth, email)        
        if (methods.length > 0) return true;
    }
    return false
}
