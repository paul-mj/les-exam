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
	survey!: ISurvey[];

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

