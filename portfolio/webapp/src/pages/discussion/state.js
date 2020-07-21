import React from 'react';
import { useLocalStore } from 'mobx-react';
import { observable, flow, decorate } from 'mobx';

import { buildApiUrl } from '../../api';

/** Loading status for the discussion comment list. */
export const LoadState = Object.freeze({
  /** Initial state: comments have not been loaded. */
  INITIAL: 'initial',

  /** 
   * Loading is in progress; a background task is running and comments should
   * appear when it finishes.
   *
   * If comments are currently being loaded, the most recent comment list or
   * error will remain set until loading finishes.
   */
  LOADING: 'loading',

  /**
   * Comments were successfully loaded, and can be accessed on the 'comments'
   * property.
   */
  LOADED: 'loaded',

  /** 
   * Loading comments failed. An error description can be accessed on the
   * 'error' property. 
   */
  FAILED: 'failed',
});

/** 
 * Stores information about what the state of the comment storage in a way
 * that can be shared across multiple React components.
 */
export class CommentsStore {

  /** State of the comment tracker. */
  state = LoadState.INITIAL;
  
  /** Which page of comments should be displayed. */
  page = 0;

  /** 
   * Number of pages of comments as of the last time comments were refreshed.
   */
  numPages = 0;

  /** The number of comments that should be displayed per page. */
  commentsPerPage = 5;

  /** Current comments to display. */
  comments = [];

  /** Error from most recent fetch failure if any. */
  error = null;

  /** Loads coments for the currently selected page. */
  loadComments = flow(function*() {
    if (this.state === LoadState.LOADING) {
      // already loading.
      return;
    }
    this.state = LoadState.LOADING;
    try {
      const result = yield fetch(buildApiUrl('discussion', {page: this.page, commentsPerPage: this.commentsPerPage}));
      this.state = LoadState.LOADED;
    } catch (error) {
      this.state = LoadState.FAILED;
      this.error = error;
    }
  });
}

// Configure observable state of the CommentsStore above. Making properties of
// the store "observable" makes it possible for other code to automatically
// react to changes to that store, e.g. by changing what is displayed on the
// page.
decorate(CommentsStore, {
  state: observable,
  page: observable,
  commentsPerPage: observable,
  comments: observable,
  error: observable,
});

/** 
 * Context base used to make a single CommentsStore visible to multiple React
 * components. This is shared between CommentsProvider (used to create a new
 * CommentsStore and make it visible to children) and useComments (used to
 * fetch the CommentsStore from a provider that is the parent of the current
 * react component.
 */
const commentsContext = React.createContext(null);

/**
 * Provides a CommentsStore to all child react componets. Child components can
 * fetch the provided store with useComments.
 */
export const CommentsProvider = ({ children }) => {
  const comments = useLocalStore(() => new CommentsStore());
  return <commentsContext.Provider value={comments}>{children}</commentsContext.Provider>
};

/** 
 * Fetch the CommentsStore provided by a parent CommentsProvider for use in the
 * current component.
 */
export const useComments = () => {
  const comments = React.useContext(commentsContext);
  if (!comments) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return comments;
};
