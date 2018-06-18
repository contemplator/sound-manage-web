import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { AppService } from './app.service';

import { TableModule } from 'primeng/table';
import { ListComponent } from './list/list.component';

import { ChipsModule, InputTextModule, ButtonModule, SharedModule } from 'primeng/primeng';
import { TagAutocompleteComponent } from './tag-autocomplete/tag-autocomplete.component';

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    TagAutocompleteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    ChipsModule,
    InputTextModule,
    ButtonModule,
    SharedModule
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
