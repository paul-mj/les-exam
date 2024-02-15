import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { IAnswer, IExamChildInput, IFinalQUestionResponse, IQuestion, MapPoints } from '../../core/interfaces/exam-interface';
import { FormsModule } from '@angular/forms';
import { EsriMapComponent } from '../esri-map/esri-map.component';

const componets = [EsriMapComponent]
@Component({
    selector: 'app-exam',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatCheckboxModule, MatMenuModule, FormsModule, EsriMapComponent],
    templateUrl: './exam.component.html',
    styleUrl: './exam.component.scss'
})

export class ExamComponent {

    questions!: IFinalQUestionResponse;
    questionMaxCount: number = 0;
    countDownTimer!: string;
    timeOutSubmit!: boolean;

    @Input() set examInputs(value: IExamChildInput) {
        if (value) {
            this.questions =  value.questions.map((qstn: IQuestion) => {
                return {
                    ...qstn, Answers: qstn.Answers.map((ans: IAnswer, i: number) => {
                        return { ...ans, points: !!ans.MAP_POINTS ? this.getMapPoints(ans.MAP_POINTS): undefined};
                    })
                }
            });
            console.log(this.questions)
            this.questionMaxCount = value.questions.length;
            this.timer(5);
        }
    }
    getMapPoints(pointString: string): MapPoints {
        const [x, y, spatialReference] = pointString.split(',').map(Number);
        return {
            x, y,
            spatialReference,
            type: 'point',
        }
    }
    previousQuestion(item: IQuestion, i: number): void {
        this.questions.map((list: IQuestion, index: number) => {
            list.isShow = index === i - 1 ? true : false;
        });
    }

    /* Next Click */
    nextQuestion(item: IQuestion, i: number): void {
        /* 30 === 30 */
        if (i + 1 === this.questionMaxCount) {
            this.reviewMyAnswers();
            return;
        }
        if (this.questionMaxCount - 1 >= i + 1) {
            this.questions.map((list: IQuestion, index: number) => {
                list.isShow = index === i + 1 ? true : false;
            });
        }
    }

    optionSelect(currentOptions: any, selectedOption: any, question: IQuestion): void {
        currentOptions.map((x: any) => { x.selected = x.isAnswered = false; });
        selectedOption.selected = true;
        question.isAnswered = true;
    }

    switchToEditAnswer(editQuestion: any): void {
        this.questions.map((list, index) => {
            list.isShow = list?.QUESTION_ID === editQuestion?.QUESTION_ID ? true : false;
        });
    }

    toggleReview($event: any, question: any): void {
        console.log($event, 'event')
        console.log(question, 'question')
    }

    reviewMyAnswers(): void {

    }

    timer(minute: number): any {
        let seconds: number = minute * 60;
        let textSec: any = '0';
        let statSec = 60;
        const prefix = minute < 10 ? '0' : '';
        const timer = setInterval(() => {
            seconds--;
            if (statSec !== 0) {
                statSec--;
            } else {
                statSec = 59;
            }
            if (statSec < 10) {
                textSec = '0' + statSec;
            } else {
                textSec = statSec;
            }
            this.countDownTimer = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
            if (seconds === 0) {
                this.timeOutSubmit = true;
                setTimeout(() => {
                    console.log(this.countDownTimer, 'countDownTimer emit')
                }, 5000);
                clearInterval(timer);
            }
        }, 1000);
    }

    completionPercentage(i: number): any {
        return Math.round(((100 * (i + 1)) / this.questionMaxCount))
    }

}
