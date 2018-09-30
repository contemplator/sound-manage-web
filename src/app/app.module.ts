import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';

import { TableModule } from 'primeng/table';
import { ListComponent } from './list/list.component';

import { InputTextModule, ButtonModule, SharedModule, FileUploadModule } from 'primeng/primeng';
import { TagAutocompleteComponent } from './tag-autocomplete/tag-autocomplete.component';
import { UploadComponent } from './upload/upload.component';

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    TagAutocompleteComponent,
    UploadComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SharedModule,
    FileUploadModule
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
