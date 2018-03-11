import { Component } from '@angular/core';
import { IpcService } from '@services/ipc.service';


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
  constructor(ipcService: IpcService) {
    try {
      const q = String((window as any).fs.readFileSync('d:/downloads/a/autocd.cpp'));
      // console.log('xx', q);

    } catch (err) {
      console.log('errrr', err);

    }
  }
}
