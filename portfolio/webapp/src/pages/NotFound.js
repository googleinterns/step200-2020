import React from 'react';

export default function NotFound() {
  return (
    <>
      <h1>Not Found</h1>
      <p>Page <code>{window.location.pathname}</code> not found.</p>
    </>
  );
}
