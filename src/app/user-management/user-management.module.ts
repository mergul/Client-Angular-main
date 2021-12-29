import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthGuard } from '../core/auth.guard';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UserManagementComponent } from './user-management.component';

const routes: Routes = [
    {path: '', component: UserManagementComponent}
];

@NgModule({
    declarations: [
        UserManagementComponent
    ],
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      ReactiveFormsModule, FormsModule
    ],
    entryComponents: [
    ],
    providers: [AuthGuard],
    bootstrap: [UserManagementComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    exports: [CommonModule]
  })
  export class UserManagementModule { }
