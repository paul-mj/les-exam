import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-verify',
    standalone: true,
    imports: [CommonModule, MatButtonModule],
    templateUrl: './verify.component.html',
    styleUrl: './verify.component.scss'
})
export class VerifyComponent {

    @Output() retryClick = new EventEmitter<void>();

    retry() {
      this.retryClick.emit();
    }

}
