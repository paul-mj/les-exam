import { CommonModule } from '@angular/common';
import { Component, Input, effect } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { IAnswer, IExamChildInput, IFinalQUestionResponse, IQuestion, MapPoints } from '../../core/interfaces/exam-interface';
import { FormsModule } from '@angular/forms';
import { EsriMapComponent } from '../esri-map/esri-map.component';
import { SignalService } from '../../core/services/signal/signal.service';

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
    constructor(private signal: SignalService) {
        effect(() => {
            this.updatePointsFromSignal = this.signal.selectedMapPoint;
        })
    }
    @Input() set examInputs(value: IExamChildInput) {
        if (value) {
            this.questions = value.questions.map((qstn: IQuestion) => {
                return {
                    ...qstn, Answers: qstn.Answers.map((ans: IAnswer, i: number) => {
                        return { ...ans, points: !!ans.MAP_POINTS ? this.getMapPoints(ans.MAP_POINTS) : undefined };
                    })
                }
            });
            this.questionMaxCount = value.questions.length;
            this.timer(5);
        }
    }
    set updatePointsFromSignal(value: any) {
        if (value) {
            const selectedQus = this.questions.find((qus => qus.isShow))
            if(selectedQus){
                const { item, isFromMap } = value[selectedQus.QUESTION_ID];
                this.questions.forEach(qstn => {
                    qstn.Answers.forEach(ans => {
                        if (ans.points && JSON.stringify(ans.points) === JSON.stringify(item)) {
                            this.changeSelectOption(qstn.Answers, ans, qstn);
                        }
                    });
                })
            }
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
    changeSelectOption(currentOptions: any, selectedOption: any, question: IQuestion): void {
        currentOptions.map((x: any) => { x.selected = x.isAnswered = false; });
        selectedOption.selected = true;
        question.isAnswered = true;
    }
    optionSelect(currentOptions: any, selectedOption: any, question: IQuestion): void {
        this.changeSelectOption(currentOptions, selectedOption, question);
        if (selectedOption.points) {
            this.signal.selectedMapPoint = {
                ...this.signal.selectedMapPoint ?? {},
                [selectedOption.QUESTION_ID]: {
                    item: selectedOption.points, isFromMap: true
                }
            };
        }
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
