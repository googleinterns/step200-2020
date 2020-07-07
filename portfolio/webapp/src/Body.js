import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';


import { Home, About, NotFound } from './pages';

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
            <Route path="*">
              <NotFound />
            </Route>
          </Switch>
        </div>
      </div>
    </div>
  );
}
