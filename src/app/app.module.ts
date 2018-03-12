import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FrameComponent } from './frame/frame.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SessionService } from './services/session.service';
import { TerminalComponent } from './terminal/terminal.component';
import { TerminalService, RemoteService } from '@services/xterm.service';

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
    MonacoEditorModule.forRoot()
  ],
  providers: [
    { provide: TerminalService, useClass: RemoteService },
    SessionService,
  ],
  entryComponents: [EditorComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
