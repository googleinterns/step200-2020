import React from 'react';

import { CommentsProvider } from './state';

export default function Discussion() {
  return (
    <>
      <h1>Please Discuss</h1>
      <CommentsProvider />
    </>
  );
}
