import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { UploadComponent } from './upload/upload.component';
import { IndexComponent } from './index/index.component';
import { CategoryComponent } from './category/category.component';

const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: 'index', component: IndexComponent },
  { path: 'list', component: ListComponent },
  { path: 'list/:keyword', component: ListComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'category', component: CategoryComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
