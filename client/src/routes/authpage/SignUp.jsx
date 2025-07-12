import './signup.css';
import { SignUp } from '@clerk/clerk-react';
import React from 'react'

function Signup() {
  return (
    <div className='signUpPage'>
      <SignUp path='/sign-up' signInUrl='/sign-in'/>
    </div>
  )
}

export default Signup
