import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { ISurvey } from '../../core/interfaces/exam-wrap.interface';

@Component({
	selector: 'app-survey',
	standalone: true,
	imports: [CommonModule, MatRadioModule, FormsModule, MatButtonModule],
	templateUrl: './survey.component.html',
	styleUrl: './survey.component.scss'
})

export class SurveyComponent {
	displayCount: any = 6;
	surveyDummyData: ISurvey[] = [
		{
			"QST_ID": 3676,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "What is your evaluation for your company management ? ",
			"OBJECT_NAME_ARABIC": "ما هو تقييمك لادارة الشركة التي تعمل بها ؟"
		},
		{
			"QST_ID": 3677,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "Your evaluation for your accommodation",
			"OBJECT_NAME_ARABIC": "تقييمك للسكن"
		},
		{
			"QST_ID": 3678,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "Commission",
			"OBJECT_NAME_ARABIC": "نظام العمولة"
		},
		{
			"QST_ID": 3679,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "TransAD exams",
			"OBJECT_NAME_ARABIC": "اختبارات ترانساد"
		},
		{
			"QST_ID": 3680,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "Weekly holidays",
			"OBJECT_NAME_ARABIC": "الاجازات الاسبوعية"
		},
		{
			"QST_ID": 10294,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "test_01",
			"OBJECT_NAME_ARABIC": "test_01"
		},
		{
			"QST_ID": 10295,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "test_02",
			"OBJECT_NAME_ARABIC": "test_02"
		},
		{
			"QST_ID": 10296,
			"OPT_1": 0,
			"OPT_2": 0,
			"OPT_3": 0,
			"OPT_4": 0,
			"OBJECT_NAME": "test_03",
			"OBJECT_NAME_ARABIC": "test_03"
		}
	]


	@Output() onClickSubmitSurvey = new EventEmitter<ISurvey[]>();

	@Input() set surveyInput(value: any) {
		if (value) {
			this.surveyDummyData = value;
		}
	}

	emitData() {
		this.onClickSubmitSurvey.emit(this.surveyDummyData);
	}
}

