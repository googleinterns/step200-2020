import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';


import { Home, About, NotFound, Justine, Leo } from './pages';

import './Body.scss';

export default function Body() {
  return (
    <div className="Body">
      <div className="content-wrap">
        <div className="main-content">
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/about">
              <About />
            </Route>
            <Route exact path="/justine">
              <Justine />
            </Route>
            <Route path="*">
              <NotFound />
            </Route>
            <Route exact path="/leo">
              <Leo />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}
