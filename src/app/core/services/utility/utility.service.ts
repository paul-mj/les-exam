import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfirmDialog } from '../../database/app.enums';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
    providedIn: 'root',
})
export class UtilityService {

    private closeDialogSubject: Subject<void> = new Subject<void>();

    
    constructor(
        public dialog: MatDialog, 
    ) { }

    
    openStatusDialog(title: string, message: string, ui: any, button?: string): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmComponent, {
            disableClose: true,
            panelClass: ['les-confirm-dialog'], 
            data: {
                ...this.dialogObject(ui, button),
                title: title,
                message: message,
            }
        });

        this.closeDialogSubject.subscribe(() => {
            dialogRef.close(false);
        });

        return dialogRef.afterClosed();
    }

    dialogObject(dialog: Number, button?: string) {
        let data = {};
        switch (dialog) {
            case ConfirmDialog.confirm:
                data = { primaryButton: button || 'Confirm', secondaryButton: 'Dismiss', Ui: ConfirmDialog.confirm, }
                break;
            case ConfirmDialog.delete:
                data = { primaryButton: 'Delete', secondaryButton: 'Dismiss', Ui: ConfirmDialog.delete, }
                break;
            case ConfirmDialog.warning:
                data = { primaryButton: 'Confirm', secondaryButton: 'Dismiss', Ui: ConfirmDialog.confirm, }
                break;
            case ConfirmDialog.error:
                data = { primaryButton: '', secondaryButton: 'Dismiss', Ui: ConfirmDialog.error, }
                break;
            case ConfirmDialog.success:
                data = { primaryButton: 'Close', secondaryButton: '', Ui: ConfirmDialog.success, }
                break;
            default:
                data = { primaryButton: 'Confirm', secondaryButton: 'Dismiss', Ui: ConfirmDialog.confirm, }
                break;
        }
        return data;
    }
    
}
