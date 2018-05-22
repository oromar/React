import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import {BrowserRouter as Router, Route, Link, NavLink} from 'react-router-dom'


const Root = () =>
<Router>
  <div>
    <Link to='/'>Home</Link>
    <Link to='/about'>About</Link>

    <Route exact path='/' component={App}/>
    <Route exact path='/about' component={About}/>

  </div>
</Router>


const About = () =>
<div>
  <h1>This is the about page...</h1>
</div>

ReactDOM.render(<Root />, document.getElementById('root'))
registerServiceWorker()
