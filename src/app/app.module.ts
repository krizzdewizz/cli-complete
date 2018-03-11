import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
// import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FrameComponent } from './frame/frame.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SessionService } from './services/session.service';
import { TerminalComponent } from './terminal/terminal.component';
import { XtermService, TerminalService } from '@services/xterm.service';
import { IpcService } from './services/ipc.service';

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    FrameComponent,
    ToolbarComponent,
    TerminalComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    // MonacoEditorModule.forRoot()
  ],
  providers: [
    { provide: TerminalService, useClass: XtermService },
    SessionService,
    IpcService,
  ],
  entryComponents: [EditorComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
