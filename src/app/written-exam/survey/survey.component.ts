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
	survey = [
		{
			QST_ID: 3676,
			OPT_1: 0,
			OPT_2: 0,
			OPT_3: 0,
			OPT_4: 0,
			OBJECT_NAME: "What is your evaluation for your company management ?",
			OBJECT_NAME_ARABIC: "ما هو تقييمك لادارة الشركة التي تعمل بها ؟"
		},
		{
			QST_ID: 3677,
			OPT_1: 0,
			OPT_2: 0,
			OPT_3: 0,
			OPT_4: 0,
			OBJECT_NAME: "Your evaluation for your accommodation",
			OBJECT_NAME_ARABIC: "تقييمك للسكن"
		}
	];

	@Output() onClickSubmitSurvey = new EventEmitter<ISurvey[]>();

	@Input() set surveyInput(value: any) {
		if (value) {
			this.survey = value.survey;
		}
	}

	emitData() {
		this.onClickSubmitSurvey.emit(this.survey);
	}
}

