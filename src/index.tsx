import React from 'react';
import 'dotenv';
import * as serviceWorker from './serviceWorker';
import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(<div><App /></div>);

serviceWorker.unregister();
