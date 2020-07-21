import React from 'react';
import { NavLink } from 'react-router-dom';

import { Paths } from './pages';

import './Nav.scss';

export default function Nav() {
  return (
    <div className="Nav">
      <div className="content-wrap">
        <nav>
          <ul>
            <li><NavLink exact to={Paths.HOME}>Home</NavLink></li>
            <li><NavLink exact to={Paths.ABOUT}>About</NavLink></li>
            <li><NavLink exact to={Paths.DISCUSSION}>Discussion</NavLink></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
