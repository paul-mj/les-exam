import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ILoader, IResponseControl, IScannerResponse, IVerifyInput } from '../../core/interfaces/exam-wrap.interface';
import { BtnLoaderComponent } from '../../shared/btn-loader/btn-loader.component';

@Component({
    selector: 'app-verify',
    standalone: true,
    imports: [CommonModule, MatButtonModule, BtnLoaderComponent],
    templateUrl: './verify.component.html',
    styleUrl: './verify.component.scss'
})
export class VerifyComponent {

    blockControl!: IResponseControl;
    scannerResponse!: IScannerResponse;

    @Output() retryClick = new EventEmitter<void>();
    @Output() reconnectScanner = new EventEmitter<void>();

    @Input() set verifyInput(value: IVerifyInput) {
        if(value) {
            this.blockControl = value.blockControl;
            this.scannerResponse = value.scannerDetails;
        }
    }

    connetToScanner() {
        this.reconnectScanner.emit();
    }

    retry() {
        this.retryClick.emit();
    }

}
