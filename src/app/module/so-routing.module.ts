import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SOComponent } from './so.components';
import { SOSearchComponent } from './so-search/so-search.component';
import { SOCreateUpdateComponent } from './so-create-update/so-create-update.component';
import { SOResolve } from './resolve/so.resolve';
import { SOAuthorizationGuard } from './guard/so.authorization.guard';


const routes: Routes = [{
  path: '',
  component: SOComponent,
  children:[{
    path: '',
    children: [
        { 
          path: '',
          component:SOSearchComponent,
       //   canActivate: [SOAuthorizationGuard],
      //    resolve: { access: SOResolve }
        },
        { 
          path: 'search', 
          component:SOSearchComponent,
       //   canActivate: [SOAuthorizationGuard],
       //   resolve: { access: SOResolve }
        },
        { 
          path: 'create', 
          component:SOCreateUpdateComponent,
        //  canActivate: [SOAuthorizationGuard],
        //  resolve: { access: SOResolve }
        },
        { 
          path: 'update', 
          component:SOCreateUpdateComponent,
        //  canActivate: [SOAuthorizationGuard],
         // resolve: { access: SOResolve }
        }
    ]
}]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})

export class SORoutingModule { }
