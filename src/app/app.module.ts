import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FrameComponent } from './frame/frame.component';
import './rxjs';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { SessionService } from './services/session.service';
import { TerminalComponent } from './terminal/terminal.component';
import { TerminalService, RemoteService } from '@services/terminal.service';
import { PromptComponent } from './prompt/prompt.component';
import { PromptService } from '@services/prompt.service';
import { FontSizeWheelService } from '@services/font-size-wheel.service';
import { QEditorComponent } from './q-editor/q-editor.component';


@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    FrameComponent,
    ToolbarComponent,
    TerminalComponent,
    PromptComponent,
    QEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MonacoEditorModule.forRoot()
  ],
  providers: [
    { provide: TerminalService, useClass: RemoteService },
    SessionService,
    PromptService,
    FontSizeWheelService
  ],
  entryComponents: [EditorComponent, QEditorComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
