import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-summary',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatExpansionModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,],
    templateUrl: './summary.component.html',
    styleUrl: './summary.component.scss'
})


export class SummaryComponent {

    @ViewChild(MatAccordion) accordion!: MatAccordion;
    groupedData: any[] = [];
    accordian: boolean = true;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<SummaryComponent>,

    ) {
        this.groupDataByCategory(data);
        console.log(this.groupedData);
    }

    groupDataByCategory(data: any) {
        const groupedDataMap: any = {};
        data?.forEach((item: any) => {
            const categoryId = item.category.CATEGORY_ID;
            if (!groupedDataMap[categoryId]) {
                groupedDataMap[categoryId] = [];
            }
            groupedDataMap[categoryId].push(item);
        });
        this.groupedData = Object.values(groupedDataMap);
    }


    onClickToQuestion(question: any) {
        this.dialogRef.close({ toQuestion: true, isComplete: false, dialogClose: true, question })
    }

    dialogClose() {
        this.dialogRef.close({ toQuestion: false, isComplete: false, dialogClose: true })
    }

    submitExam() {
        this.dialogRef.close({ toQuestion: false, isComplete: true, dialogClose: true, })
    }

    clicktoggle() {
        this.accordian = !this.accordian
        console.log(this.accordian)
    }

}
