import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EditorComponent } from './editor/editor.component';
import { FrameComponent } from './frame/frame.component';
import './rxjs';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TerminalComponent } from './terminal/terminal.component';
import { TerminalService, RemoteService } from '@services/terminal.service';
import { PromptComponent } from './prompt/prompt.component';
import { PromptService } from '@services/prompt.service';
import { FontSizeWheelService } from '@services/font-size-wheel.service';
import { QEditorComponent } from './q-editor/q-editor.component';
import { waitForMonaco } from './editor/monaco-ready';
import { FrameService } from './frame/frame.service';

export function waitForMonacoFactory() {
  return () => waitForMonaco();
}

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
    FormsModule
  ],
  providers: [
    { provide: TerminalService, useClass: RemoteService },
    { provide: APP_INITIALIZER, multi: true, useFactory: waitForMonacoFactory },
    PromptService,
    FontSizeWheelService,
    FrameService
  ],
  entryComponents: [EditorComponent, QEditorComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
