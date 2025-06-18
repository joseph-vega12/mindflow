import * as moduleAlias from 'module-alias';
import * as admin from 'firebase-admin';

function bootstrap() {
  // Resolving the path to the functions folder
  // https://www.npmjs.com/package/module-alias
  moduleAlias.addAlias('types', __dirname + '../../src/types');

  admin.initializeApp({
    // // apiKey: 'AIzaSyBm3IcFuYX_jKnzeRMaxW4gKbGKwSLT_OE',
    // // authDomain: 'mindflow-1e15b.firebaseapp.com',
    databaseURL: 'https://mindflow-1e15b.firebaseio.com'
    // projectId: 'mindflow-1e15b',
    // storageBucket: 'mindflow-1e15b.appspot.com',
    // // messagingSenderId: '701474285581',
    // appId: '1:701474285581:web:dce086de5a957d41d40d44',
  });

  admin.firestore().settings({ ignoreUndefinedProperties: true });
}

bootstrap();

export { api } from './http';
export { pubSubs } from './pubSub';
export { triggers } from './triggers';
