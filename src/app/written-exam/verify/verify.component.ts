import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ILoader, IResponseControl, IVerifyInput } from '../../core/interfaces/exam-wrap.interface';

@Component({
    selector: 'app-verify',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './verify.component.html',
    styleUrl: './verify.component.scss'
})
export class VerifyComponent {

    blockControl!: IResponseControl;

    @Output() retryClick = new EventEmitter<void>();

    @Input() set verifyInput(value: IVerifyInput) {
        if(value) {
            this.blockControl = value.blockControl;
        }
    }

    retry() {
        this.retryClick.emit();
    }

}
