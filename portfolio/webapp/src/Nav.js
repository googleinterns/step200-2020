import React from 'react';
import { NavLink } from 'react-router-dom';

import './Nav.scss';

export default function Nav() {
  return (
    <div className="Nav">
      <div className="content-wrap">
        <nav>
          <ul>
            <li><NavLink to="/" exact={true}>Home page</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/leo">Leo Page</NavLink></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
