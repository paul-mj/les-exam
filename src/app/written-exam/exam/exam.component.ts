import { CommonModule } from '@angular/common';
import { Component, Input, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { IAnswer, IExamChildInput, IFinalQUestionResponse, IQuestion, MapPoints } from '../../core/interfaces/exam-interface';
import { FormsModule } from '@angular/forms';
import { EsriMapComponent } from '../esri-map/esri-map.component';
import { SignalService } from '../../core/services/signal/signal.service';
import { CircularProgressComponent } from "../circular-progress/circular-progress.component";
import { SummaryComponent } from '../summary/summary.component';
import { TransLine } from '../../core/interfaces/exam-wrap.interface';

const componets = [EsriMapComponent]
@Component({
    selector: 'app-exam',
    standalone: true,
    templateUrl: './exam.component.html',
    styleUrl: './exam.component.scss',
    imports: [CommonModule, MatButtonModule, MatCheckboxModule, MatMenuModule, FormsModule, EsriMapComponent, CircularProgressComponent]
})

export class ExamComponent {

    questions!: IFinalQUestionResponse;
    questionMaxCount: number = 0;
    countDownTimer!: string;
    examDefaultTimer!: number;
    timeOutSubmit!: boolean;
    completeQuesPercentage: number = 0;
    currentQuestionIndex: number = 1;
    resetTimer: any;

    constructor(
        private signal: SignalService,
        public dialog: MatDialog
    ) {
        effect(() => {
            this.updatePointsFromSignal = this.signal.selectedMapPoint;
            const userTransReadLine: TransLine = this.signal.getUserTypeTransLine;
            if (userTransReadLine?.EXTRA_TIME) { 
                this.examDefaultTimer += Number(userTransReadLine.EXTRA_TIME);
                this.updateTimer();
            }
        });
    }

    updateTimer(): void {
        clearInterval(this.resetTimer);
        this.timer(this.examDefaultTimer);
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
            this.examDefaultTimer = value.examConfig?.ASSESSMENT_DURATION_TIMER || 1;
            this.timer(this.examDefaultTimer);
        }
    }



    set updatePointsFromSignal(value: any) {
        if (value) {
            const selectedQus = this.questions.find((qus => qus.isShow))
            this.completionPercentage();
            if (selectedQus) {
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

    prevQuesButton() {
        if (this.currentQuestionIndex > 1) { 
            this.previousQuestion(this.currentQuestionIndex);
        }
    }

    nextQuesButton() { 
        this.nextQuestion(this.currentQuestionIndex);
    }

    previousQuestion(i: number): void {
        if (i > 1) {
            this.currentQuestionIndex = i - 1;
            this.questions.map((list: IQuestion, index: number) => {
                list.isShow = index === i - 2 ? true : false; // Adjusted index
            });
        }
    }

    nextQuestion(i: number): void {
        this.currentQuestionIndex = i + 1;
        if (i === this.questionMaxCount) {
            this.reviewMyAnswers();
            return;
        }

        if (this.questionMaxCount >= i + 1) {
            this.questions.map((list: IQuestion, index: number) => {
                list.isShow = index === i ? true : false; // Adjusted index
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
        this.completionPercentage();
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
            /* list.isShow = (list?.QUESTION_ID === editQuestion?.QUESTION_ID) ? true : false; */
            if(list?.QUESTION_ID === editQuestion?.QUESTION_ID) {
                this.currentQuestionIndex = index + 1; 
                list.isShow = true;
            } else {
                list.isShow = false;
            }
        });
    }

    toggleReview($event: any, question: any): void {
        console.log($event, 'event')
        console.log(question, 'question')
    }

    reviewMyAnswers(): void {

    }

    timer(minutes: number): void {
        console.log(minutes)
        if(this.resetTimer){
            clearInterval(this.resetTimer);
        }
        let seconds: number = (minutes * 60);
        let textSec: any = '0';
        let statSec = 60;
        const prefix = minutes < 10 ? '0' : '';

        this.resetTimer = setInterval(() => {
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
                clearInterval(this.resetTimer);
            }
        }, 1000);
    }



    questionProgress(i: number): any {
        return Math.round(((100 * (i + 1)) / this.questionMaxCount))
    }

    add_remove_Review(question: any) {
        question.isReview = !question.isReview;
    }

    completionPercentage(): any {
        const ansLength = this.questions.filter((x: IQuestion) => x.isAnswered)?.length;
        this.completeQuesPercentage = Math.round(((100 * (ansLength)) / this.questionMaxCount));
    }

    onClickToReviewExam(): void {
        const dialogRef = this.dialog.open(SummaryComponent, {
            data: this.questions,
            disableClose: false
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result.toQuestion) {
                this.switchToEditAnswer(result.question);
            } else {

            }
        });
    }

    completeExam(): void {

    }

}

