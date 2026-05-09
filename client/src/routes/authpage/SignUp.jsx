import './signUp.css';
import { SignUp } from '@clerk/clerk-react';

function Signup() {
  return (
    <div className='signUpPage'>
      <SignUp path='/sign-up' signInUrl='/sign-in' forceRedirectUrl='/dashboard' />
    </div>
  )
}

export default Signup
