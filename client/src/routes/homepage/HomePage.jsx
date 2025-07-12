import { Link } from 'react-router-dom';
import './homepage.css';


function HomePage() {

  return (
    <div className='homePage'>
      <img src='/orbital.png' alt='orbital' className='orbital-image' />

      <div className='left-div'>
        <h1>AI CHAT BOT</h1>
        <h2>Increase your productivity with our AI-powered chat solutions.</h2>
        <h3>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit voluptatum velit voluptas tenetur corrupti vero qui ipsa vitae eius.</h3>
        <Link to='/sign-in' className='sign-in-link'>Get Started</Link>
      </div>

      <div className='right-div'>
        <div className='img-container'>
          <div className="bg-container">
            <div className="bg"></div>
          </div>
          <img src='/bot.png' alt='bot' className='bot-image' />
        </div>
      </div>
      <div className="terms">
        <img src='/Logo.jpg' alt='logo' className='logo' />
        <div className='links'>
          <Link to='/'>Terms of Service</Link>
          <span>|</span>
          <Link to='/'>Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
