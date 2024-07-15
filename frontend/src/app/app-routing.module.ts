import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { AddpostComponent } from './addpost/addpost.component';
import { PostlistsComponent } from './postlists/postlists.component';
import { MypostsComponent } from './myposts/myposts.component';

const routes: Routes = [
  { path: '', component: PostlistsComponent },
  { path: 'signup', component: SigninComponent }, 
  { path: 'login', component: LoginComponent}, 
  { path: 'addpost', component:AddpostComponent}, 
  { path: 'myposts', component:MypostsComponent}, 
  { path: 'allposts', component:PostlistsComponent}, 
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
