import React from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';


import { Home, About, Discussion, NotFound, Paths } from './pages';

import './Body.scss';

export default function Body() {
  return (
    <div className="Body">
      <div className="content-wrap">
        <div className="main-content">
          <Switch>
            <Route exact path={Paths.HOME}>
              <Home />
            </Route>
            <Route exact path={Paths.ABOUT}>
              <About />
            </Route>
            <Route exact path={Paths.DISCUSSION}>
              <Discussion />
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
