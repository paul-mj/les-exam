import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { INewExamOrRetest } from '../../core/interfaces/exam-interface';

@Component({
    selector: 'app-result',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './result.component.html',
    styleUrl: './result.component.scss'
})

export class ResultComponent {
 
    @Output() toRetestOrRenew = new EventEmitter<INewExamOrRetest>();

    resetOrRenew(): void {
        this.toRetestOrRenew.emit({isRetest: true});
    }

}
