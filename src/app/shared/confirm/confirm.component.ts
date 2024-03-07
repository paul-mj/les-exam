import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm',
    standalone: true,
    imports: [CommonModule, DialogModule],
    templateUrl: './confirm.component.html',
    styleUrl: './confirm.component.scss'
})
export class ConfirmComponent {


    icon: any;
    className: any;

    constructor(
        public dialogRefToastDialog: MatDialogRef<ConfirmComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit() {
        this.dialogIcon();
    }

    dialogIcon = () => {

        switch (this.data.Ui) {
            case 101:
                this.icon = "assets/images/caution.png"
                this.className = "confirm"
                break;
            case 102:
                this.icon = "assets/images/trash.png"
                this.className = "delete"
                break;
            case 103:
                this.icon = "assets/images/tick.png"
                this.className = "success"
                break;
            case 105:
                this.icon = "assets/images/remove.png"
                this.className = "error"
                break;
            default:
                break;
        }
        return this.icon;
    }

    onClickConfirmClose(): void {
        this.dialogRefToastDialog.close(this.data?.action ? this.data?.action : true);
    }

    closeDialog(): void {
        this.dialogRefToastDialog.close();
    }
}