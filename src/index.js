import React from 'react';
import ReactDOM from 'react-dom/client'; // Import from 'react-dom/client'

const element = <h1>Hello, world!</h1>;
const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root
root.render(element); // Render to the root