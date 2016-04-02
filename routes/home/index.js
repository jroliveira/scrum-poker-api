'use strict';

import pkg from './../../package.json';

async function index(ctx, next) {
  ctx.body = {
    name: pkg.name,
    version: pkg.version,
    message: 'I\'m working...'
  };
}

export default index;
