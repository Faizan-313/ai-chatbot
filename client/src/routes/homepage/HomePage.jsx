import { Link } from 'react-router-dom';
import './homepage.css';


function HomePage() {

  return (
    <div className='homePage'>
      <div className="homePage__ambient" aria-hidden />
      <img src='/orbital.png' alt='' className='orbital-image' />

      <div className='left-div'>
        <p className="home-eyebrow">Intelligent assistance</p>
        <h1>AI Chat Bot</h1>
        <p className="home-lead">
          Ship faster with an AI partner that understands context, keeps conversations organized,
          and stays ready when you are.
        </p>
        <ul className="home-highlights" aria-label="Product highlights">
          <li>Context-aware replies tailored to your workflow</li>
          <li>Clean, distraction-free chat experience</li>
          <li>Built for teams who value clarity and speed</li>
        </ul>
        <div className="home-cta-row">
          <Link to='/sign-in' className='sign-in-link'>Get started</Link>
        </div>
      </div>

      <div className='right-div'>
        <figure className='hero-visual'>
          <div className='img-container'>
            <div className="bg-container">
              <div className="bg" />
            </div>
            <img src='/bot.png' alt='AI assistant illustration' className='bot-image' />
          </div>
          <figcaption className="hero-visual__caption">Your workspace, elevated</figcaption>
        </figure>
      </div>
      <footer className="terms">
        <img src='/Logo.jpg' alt='' className='terms__mark' />
        <div className='links'>
          <Link to='/'>Terms of Service</Link>
          <span aria-hidden="true">·</span>
          <Link to='/'>Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
