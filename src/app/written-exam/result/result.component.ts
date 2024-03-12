import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { INewExamOrRetest, ResultData } from '../../core/interfaces/exam-interface';


@Component({
    selector: 'app-result',
    standalone: true,
    imports: [CommonModule],
    providers: [DatePipe],
    templateUrl: './result.component.html',
    styleUrl: './result.component.scss'
})

export class ResultComponent {

    resultData!: ResultData;
    @Output() toRetestOrRenew = new EventEmitter<INewExamOrRetest>();
    @Input() set examResultResponse(value: any) {
        if (value) { 
            this.resultData = value;
        }
        console.log(this.resultData)
    }

    resetOrRenew(): void {
        this.toRetestOrRenew.emit({ isRetest: true });
    }

}
