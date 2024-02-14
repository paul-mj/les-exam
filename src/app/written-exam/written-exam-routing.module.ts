import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExamWrapperComponent } from './exam-wrapper/exam-wrapper.component';

const routes: Routes = [
    {
        path: '',
        component: ExamWrapperComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class WrittenExamRoutingModule { }
