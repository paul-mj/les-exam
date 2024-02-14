import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./written-exam/written-exam.module').then(m => m.WrittenExamModule)
    }

];
