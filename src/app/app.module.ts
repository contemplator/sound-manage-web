import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';

import { TableModule } from 'primeng/table';
import { ListComponent } from './list/list.component';

import { InputTextModule, ButtonModule, SharedModule } from 'primeng/primeng';
import { TagAutocompleteComponent } from './tag-autocomplete/tag-autocomplete.component';

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    TagAutocompleteComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SharedModule
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
