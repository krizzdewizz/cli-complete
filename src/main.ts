import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// window.nodeRequire = require;

const wnd = window as any;
wnd.$ = wnd.jQuery = require('../node_modules/jquery/dist/jquery.js');

// declare const remote;
// const remoteMain = remote.require('./qbert');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);
