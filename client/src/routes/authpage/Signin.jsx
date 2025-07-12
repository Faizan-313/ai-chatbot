import './signin.css';
import { SignIn } from '@clerk/clerk-react';

import React from 'react'

function Signin() {
  return (
    <div className='signInPage'>
      <SignIn 
        path='/sign-in' 
        signUpUrl='/sign-up' 
        forceRedirectUrl='/dashboard' 
      />
    </div>
  )
}

export default Signin
