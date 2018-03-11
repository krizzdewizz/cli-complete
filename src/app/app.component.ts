import { Component } from '@angular/core';


// const r = require('electron').remote;
const { remote } = window.require('electron');

const qbert = remote.require('./app/qbert');

console.log('qbert', qbert.qbert());

@Component({
  selector: 'clic-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
}
