import { CommonModule, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, Output, effect } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { IAnswer, IExamChildInput, IExamCompleteEmitResponse, IFinalQUestionResponse, IOptionSave, IQuestion, ISummaryDialogResponse, MapPoints } from '../../core/interfaces/exam-interface';
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
    extraTime = 0;
    currentExtraTime = 0;
    timerunner: any;
    displayLanguage: string = 'En';
    answeredCounts: any = [];
    categoryList: any;
    timerExipiry!: number;
    updatedTimeDistance!: number;
    questions!: IFinalQUestionResponse;
    questionMaxCount: number = 0;
    countDownTimer: string = '00:00';
    examDefaultTimer!: number;
    timeOutSubmit!: boolean;
    completeQuesPercentage: any = 0;
    currentQuestionIndex: number = 1;
    resetTimer: any;
    @Output() onClickExamComplete = new EventEmitter<IExamCompleteEmitResponse>();
    @Output() onClickOptionSave = new EventEmitter<IOptionSave>();


    constructor(
        private signal: SignalService,
        public dialog: MatDialog
    ) {
        effect(() => {
            this.updatePointsFromSignal = this.signal.selectedMapPoint;
            const userTransReadLine: TransLine = this.signal.getUserTypeTransLine;
            if (userTransReadLine?.EXTRA_TIME) {
                if(this.extraTime != userTransReadLine?.EXTRA_TIME){
                    this.currentExtraTime = this.extraTime ?  userTransReadLine?.EXTRA_TIME - this.extraTime : userTransReadLine?.EXTRA_TIME;
                    this.extraTime = userTransReadLine?.EXTRA_TIME;
                    console.log(this.currentExtraTime);
                    this.examDefaultTimer += Number(this.currentExtraTime);
                    // this.updateTimer();
                    this.updateTimerV2(this.currentExtraTime);
                }
            }
        });


    }

    toggleLanguage: any = [
        {
            id: 1,
            language: 'En',
            active: true
        },
        {
            id: 2,
            language: 'Ar',
            active: false
        }
    ]

    initTimer(min = 2) {
        this.timerExipiry = new Date().setMinutes(new Date().getMinutes() + min);
        this.timerV2();
    }
    updateTimerV2(min: number): void {
        const existingMin = new Date().getMinutes();
        const t1 = new Date(new Date().setMinutes(existingMin + min)).getTime();
        this.timerExipiry = new Date().setTime(t1 + Number(this.updatedTimeDistance ?? 0));
        clearInterval(this.timerunner);
        this.timerV2();
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
            console.log(this.questions)
            this.questionMaxCount = value.questions.length;
            /* this.examDefaultTimer = value.examConfig?.ASSESSMENT_DURATION_TIMER;
            // this.timer(this.examDefaultTimer);
            this.initTimer(value.examConfig?.ASSESSMENT_DURATION_TIMER) */

            this.examDefaultTimer = value.examSetting?.EXAM_DURATION;
            this.initTimer(value.examSetting?.EXAM_DURATION)

            this.getcategoriesList();
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

    changeSelectOption(currentOptions: IAnswer[], selectedOption: any, question: IQuestion): void {
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
                    item: selectedOption.points,
                    isFromMap: true
                }
            };
        }
        this.saveSelectedOptoin(currentOptions, selectedOption, question);
        this.getcategoriesList()
    }

    saveSelectedOptoin(currentOptions: IAnswer[], selectedOption: any, question: IQuestion): void {
        this.onClickOptionSave.emit({
            currentOptions,
            selectedOption,
            question
        })
    }

    switchToEditAnswer(editQuestion: any): void {
        this.questions.map((list, index) => {
            /* list.isShow = (list?.QUESTION_ID === editQuestion?.QUESTION_ID) ? true : false; */
            if (list?.QUESTION_ID === editQuestion?.QUESTION_ID) {
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

    // timer(minutes: number): void {
    //     if (this.resetTimer) {
    //         clearInterval(this.resetTimer);
    //     }
    //     let seconds: number = (minutes * 60);
    //     let textSec: any = '0';
    //     let statSec = 60;
    //     const prefix = minutes < 10 ? '0' : '';

    //     this.resetTimer = setInterval(() => {
    //         seconds--;
    //         if (statSec !== 0) {
    //             statSec--;
    //         } else {
    //             statSec = 59;
    //         }
    //         if (statSec < 10) {
    //             textSec = '0' + statSec;
    //         } else {
    //             textSec = statSec;
    //         }
    //         this.countDownTimer = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
    //         if (seconds === 0) {
    //             this.timeOutSubmit = true;
    //             setTimeout(() => {
    //                 this.completeExam()
    //             }, 5000);
    //             clearInterval(this.resetTimer);
    //         }
    //     }, 1000);
    // }

    /* remainingTimePercentage(): string {
        const totalSeconds = this.examDefaultTimer * 60;
        const remainingSeconds = (parseInt(this.countDownTimer.split(':')[0]) * 60) + parseInt(this.countDownTimer.split(':')[1]);
        const percentage = (remainingSeconds / totalSeconds) * 100;
        return percentage.toFixed(2) + '%';
    } */
    elapsedTimePercentage(): string {
        const totalSeconds = this.examDefaultTimer * 60;
        const elapsedSeconds = (totalSeconds) - ((parseInt(this.countDownTimer.split(':')[0]) * 60) + parseInt(this.countDownTimer.split(':')[1]));
        const percentage = (elapsedSeconds / totalSeconds) * 100;
        return percentage.toFixed(2) + '%';
    }



    questionProgress(i: number): any {
        return Math.round(((100 * (i + 1)) / this.questionMaxCount))
    }

    add_remove_Review(question: any) {
        question.isReview = !question.isReview;
    }

    completionPercentage(): any {
        const ansLength = this.questions.filter((x: IQuestion) => x.isAnswered)?.length;
        this.completeQuesPercentage = Math.round(((100 * (ansLength)) / this.questionMaxCount)) + '%';
        console.log(this.completeQuesPercentage)
    }

    onClickToReviewExam(): void {
        const dialogRef = this.dialog.open(SummaryComponent, {
            data: this.questions,
            disableClose: false
        });

        dialogRef.afterClosed().subscribe((result: ISummaryDialogResponse) => {
            if (result.toQuestion) {
                this.switchToEditAnswer(result.question);
            } else if (result.isComplete) {
                this.completeAlert()
            }
        });
    }

    completeAlert() {
        alert('Are you sure you want to complete your exam')
        this.completeExam();
    }

    completeExam(): void {
        if (this.resetTimer) {
            clearInterval(this.resetTimer);
            /* this.examDefaultTimer = 0;
            this.countDownTimer = '00:00';
            this.completeQuesPercentage = 0;
            this.currentQuestionIndex = 1; */
        }
        this.onClickExamComplete.emit({
            question: this.questions,
            examTimer: this.countDownTimer,
            endTime: this.formatDateToenUS(new Date(), 'dd-MMM-yyyy HH:mm:ss')
        })
    }

    formatDateToenUS(date: Date, format: string): any {
        return formatDate(date, format, 'en-US');
    }


    // -----------------Timer-------------
    get distance() {
        const days = Math.floor(this.updatedTimeDistance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((this.updatedTimeDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((this.updatedTimeDistance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((this.updatedTimeDistance % (1000 * 60)) / 1000);
        return {
            days, hours, minutes, seconds
        }
    }
    timerV2() {
        if (!this.timerExipiry) {
            return;
        }

        const padWithLeadingZeros = (num: number, totalLength: number) => {
            return String(num).padStart(totalLength, '0');
        }
        if (this.timerunner) {
            clearInterval(this.timerunner);
        }
        this.timerunner = setInterval(() => {
            const now = new Date().getTime();
            this.updatedTimeDistance = this.timerExipiry - now;


            const hrs = this.distance.hours ? `${padWithLeadingZeros(this.distance.hours, 2)}:` : '';
            this.countDownTimer = `${hrs}${padWithLeadingZeros(this.distance.minutes, 2)}:${padWithLeadingZeros(this.distance.seconds, 2)}`;
            if (this.updatedTimeDistance < 0) {
                clearInterval(this.timerunner);
                this.countDownTimer = "00:00";
                this.timeOutSubmit = true;
                setTimeout(() => {
                    this.completeExam()
                }, 5000);
            }
        }, 1000);
    }



    getcategoriesList() {
        console.log(this.questions)
        const groupedDataMap: any = {};
        this.questions?.forEach((item: any) => {
            const categoryId = item.category.CATEGORY_ID;
            if (!groupedDataMap[categoryId]) {
                groupedDataMap[categoryId] = [];
            }
            groupedDataMap[categoryId].push(item);
        });
        this.categoryList = Object.values(groupedDataMap);
        console.log(this.categoryList)

        this.categoryList.forEach((category: any[]) => {
            // Count the number of objects where 'isAnswered' is true
            const answeredCount = category.filter(item => item.isAnswered).length;
            // Append the count to the list
            console.log(answeredCount)
            category.forEach(item => item.answeredCount = answeredCount);
        });
        console.log(this.categoryList)
    }


    clickLanguage(code: any) {
        this.displayLanguage = this.toggleLanguage[code].language;
        console.log(this.displayLanguage)
        this.toggleLanguage = this.toggleLanguage.map((item: any, index: any) => {
            if (code === index) {
                return {
                    ...item,
                    active: true,
                }
            }
            else {
                return {
                    ...item,
                    active: false
                }
            }
        });
    }
}

