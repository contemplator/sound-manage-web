import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { TableModule } from 'primeng/table';
import { InputTextModule, ButtonModule, SharedModule, FileUploadModule, MessageService, PanelModule, ListboxModule, AutoCompleteModule, BlockUIModule, InputSwitchModule, DialogModule } from 'primeng/primeng';
import { ToastModule } from 'primeng/toast';
import { ListComponent } from './list/list.component';
import { TagAutocompleteComponent } from './tag-autocomplete/tag-autocomplete.component';
import { UploadComponent } from './upload/upload.component';
import { IndexComponent } from './index/index.component';
import { LoadingComponent } from './loading/loading.component';
import { CategoryComponent } from './category/category.component';
import { AddCategoryModalComponent } from './category/add-category-modal/add-category-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    TagAutocompleteComponent,
    UploadComponent,
    IndexComponent,
    LoadingComponent,
    CategoryComponent,
    AddCategoryModalComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    SharedModule,
    FileUploadModule,
    ToastModule,
    PanelModule,
    ListboxModule,
    InputTextModule,
    AutoCompleteModule,
    BlockUIModule,
    InputSwitchModule,
    DialogModule,
    ReactiveFormsModule
  ],
  providers: [
    AppService,
    MessageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
