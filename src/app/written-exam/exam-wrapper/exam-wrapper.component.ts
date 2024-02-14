import { Component } from "@angular/core";
import { CenterComponent } from "../center/center.component";
import { VerifyComponent } from "../verify/verify.component";
import { UserDetailsComponent } from "../user-details/user-details.component";
import { ExamComponent } from "../exam/exam.component";
import { CommonModule } from "@angular/common";
import { SurveyComponent } from "../survey/survey.component";
import { SummaryComponent } from "../summary/summary.component";
import { ResultComponent } from "../result/result.component";
import {
    IAssessmentStatusInfo,
    ICaptureResponse,
    ICenter,
    IConfigResponse,
    IConfiguration,
    IDeviceInfo,
    IDeviceLine,
    IDeviceLineResponse,
    IEnrolledList,
    IEnrolledResponse,
    IFingerVerifyResponse,
    IQuesSettingsPayload,
    IReadDeviceLinePayload,
    IReadImpressionPayload,
    IReadImpressionResponse,
    IReadProfile,
    IReadProfileResponse,
    IReadSettings,
    IRegisterDevice,
    ISaveStatusResponse,
    IScanner,
    IScannerResponse,
    IScreenControls,
    ISurvey,
    ITranslineResponse,
    IUpdateAddress,
    IVerifiedUserData,
    IVerifyDevice,
    IVerifyDeviceResponse,
    IVerifyPayload,
    TransLine,
} from "../../core/interfaces/exam-wrap.interface";
import { PingService } from "../../core/services/ping/ping.service";
import {
    Observable,
    Subject,
    Subscription,
    catchError,
    concatMap,
    distinctUntilChanged,
    forkJoin,
    interval,
    map,
    mergeMap,
    of,
    switchMap,
    takeUntil,
} from "rxjs";
import { ApiService } from "../../core/services/api/api.service";
import { API } from "../../core/application/api.config";
import { BlobResponse, IAnswer, ICategory, IExamResponse, IFinalQUestionResponse, IQuestion } from "../../core/interfaces/exam-interface";
import { DeviceExamStatus, deviceStatusEnum, examTypeEnum, userTypeEnum } from "../../core/database/app.enums";

@Component({
    selector: "app-exam-wrapper",
    standalone: true,
    imports: [
        CommonModule,
        CenterComponent,
        VerifyComponent,
        UserDetailsComponent,
        ExamComponent,
        SurveyComponent,
        SummaryComponent,
        ResultComponent,
    ],
    templateUrl: "./exam-wrapper.component.html",
    styleUrl: "./exam-wrapper.component.scss",
})
export class ExamWrapperComponent {
    centerList!: ICenter[];
    pingError: any;
    screenControl: IScreenControls = {
        center: false,
        verify: false,
        userDetails: false,
        survey: false,
        exam: false,
        summary: false,
        result: false,
    };
    deviceInfo!: IDeviceInfo;
    verifiedDeviceData!: IVerifyDevice;
    configuration!: IConfiguration;
    scannerDetails!: IScanner;
    captureResponse!: ICaptureResponse;
    enrolledList!: IEnrolledList[];
    verifiedUserData!: IVerifiedUserData;
    readSettings!: IReadSettings;
    readUserProfile!: IReadProfile;
    surveyQuestions!: ISurvey;
    userTransData!: TransLine;

    assessmentStatusInfo: IAssessmentStatusInfo = {
        LineId: -1,
        CentreId: -1,
        DeviceId: -1,
        UserId: 3,
        LineStatus: Number(deviceStatusEnum.None),
        StartTime: null,
        ExtraTime: 0,
        UserType: 0,
        ExtraRemarks: '',
        EndRemarks: '',
        Table: null,
    }

    iStatus!: number;
    extraTime!: number;
    examQuestions!: IFinalQUestionResponse;

    pingSubscription!: Subscription;
    deviceUpdateSubscription!: Subscription;
    assessmentTimesSubscription!: Subscription;
    private unSubscribeDeviceLine$ = new Subject<void>();
    private intervalAssessmentScreen$ = new Subject<void>();


    constructor(private ping: PingService, private api: ApiService) { }

    ngOnInit(): void {
        this.loadQuestions__Test();
        /* this.pingChecking(); */
    }

    pingChecking(): void {
        this.ping.startService();
        this.ping.getStatus().subscribe((response: string) => {
            this.ping.triggerMsg = response;
        });
        this.pingToaster();
    }

    pingToaster(): void {
        this.pingSubscription = this.ping.getMsgStatus
            .pipe(distinctUntilChanged())
            .subscribe((res: string) => {
                this.pingError = res;
                if (res === "error") {
                    console.log("Local service not connect");
                } else {
                    this.getDeviceInformation();
                    this.getCenters();
                    console.log("Local service connect success");
                }
            });
    }

    getCenters() {
        const objList = {
            TransAdExaminationCentre: 1054,
        };
        const getData = (drpValues: any) => {
            return {
                Ids: Object.values(drpValues),
                CultureId: 0,
            };
        };
        this.api
            .httpPost({ url: "Assessment/getObjects", data: getData(objList) })
            .subscribe((response: ICenter[]) => {
                this.centerList = response;
            });
    }

    getDeviceInformation(): void {
        this.api
            .httpLocalGet({ url: API.device.getDeviceInfo })
            .subscribe((respose: IDeviceInfo) => {
                this.deviceInfo = respose;
                this.toggleScreen("center"); //Show Examination Center Screen
                this.verifyIsDeviceIsRegistered();
            });
    }

    verifyIsDeviceIsRegistered(): void {
        this.api
            .httpGet({ url: `Assessment/verifyDevice?key=${this.deviceInfo.BiosId}` })
            .subscribe((response: IVerifyDeviceResponse) => {
                if (!response.Valid) {
                    //this.registerDevice();
                } else {
                    this.verifiedDeviceData = response.Data;
                    this.assessmentStatusInfo = {
                        ...this.assessmentStatusInfo,
                        CentreId: this.verifiedDeviceData.CENTRE_ID,
                        DeviceId: this.verifiedDeviceData.DEVICE_ID,
                    };

                    if (this.deviceInfo.IP4Address !== response.Data.DEVICE_IP) {
                        this.updateAddress();
                    }
                    this.callDeviceCommonDatas()
                    this.initScanner();
                    this.toggleScreen("verify"); //Show User Verify Screen
                }
            });
    }

    registerDevice($event: IRegisterDevice) {
        this.api
            .httpPost<IRegisterDevice>({
                url: `Assessment/registerDevice`,
                data: $event,
            })
            .subscribe((response: any) => {
                if (response.Id > 0) {
                    this.verifyAfterNewDeviceRegister();
                    this.callDeviceCommonDatas()
                    this.initScanner();
                    this.toggleScreen("verify"); //Show User Verify Screen
                }
            });
    }

    /* After Verify Device or Register New Device */
    callDeviceCommonDatas(): void {
        this.saveDeviceStatusEvery__3__Min();
        this.readConfig();
        this.getReadDeviceLine().subscribe((deviceLineResponse: IDeviceLineResponse) => {
            if (deviceLineResponse.Valid) {
                this.assessmentStatusInfo = {
                    ...this.assessmentStatusInfo,
                    CentreId: deviceLineResponse.Data.CENTRE_ID,
                    UserType: deviceLineResponse.Data.USER_TYPE
                };
            }
        });
    }

    getReadDeviceLine(): Observable<any> {
        const data: IReadDeviceLinePayload = {
            Id: this.verifiedDeviceData.DEVICE_ID,
            CultureId: 0,
        };
        return this.api.httpPost<IReadDeviceLinePayload>({
            url: `Assessment/readDeviceLine`,
            data,
        });
    }

    verifyAfterNewDeviceRegister(): void {
        this.api
            .httpGet({ url: `Assessment/verifyDevice?key=${this.deviceInfo.BiosId}` })
            .subscribe((response: IVerifyDeviceResponse) => {
                if (response.Valid) {
                    this.verifiedDeviceData = response.Data;
                }
            });
    }

    updateAddress(): void {
        const data: IUpdateAddress = {
            DeviceIp: this.deviceInfo.IP4Address,
            DeviceKey: this.deviceInfo.BiosId,
        };
        this.api.httpPost<IUpdateAddress>({ url: `Assessment/updateAddress`, data })
            .subscribe;
    }

    saveDeviceStatusEvery__3__Min(): void {
        const min = 3 * 60 * 1000; /* 3 Minute */
        const interval$ = interval(min);
        this.deviceUpdateSubscription = interval$
            .pipe(switchMap((res: any) => this.saveDeviceStatus()))
            .subscribe();
    }

    saveDeviceStatus(): Observable<any> {
        const data: IUpdateAddress = {
            DeviceIp: this.deviceInfo.IP4Address,
            DeviceKey: this.deviceInfo.BiosId,
        };
        return this.api.httpPost<IUpdateAddress>({
            url: `Assessment/saveDeviceStatus`,
            data,
        });
    }

    readConfig(): void {
        this.api
            .httpGet({ url: `Assessment/readConfig` })
            .subscribe((response: IConfigResponse) => {
                if (response.Valid) {
                    this.configuration = response.Data;
                    this.AssessmentScreenTimer();
                }
            });
    }

    AssessmentScreenTimer(): void {
        const seconds: number = this.configuration.ASSESSMENT_SCREEN_TIMER * 1000;
        const intervalAssessmentScreen$ = interval(seconds);
        this.assessmentTimesSubscription = intervalAssessmentScreen$.pipe(
            switchMap(() => this.getReadDeviceLine()),
            map(deviceLineResponse => {
                return deviceLineResponse;
            })
        ).subscribe((deviceLineResponse: IDeviceLineResponse) => {
            this.processDeviceData(deviceLineResponse.Data);
        });
    }

    initScanner(): void {
        this.api
            .httpLocalGet({ url: "scanner/discoverScanners" })
            .subscribe((response: IScannerResponse) => {
                if (response.Valid) {
                    this.scannerDetails = response.Scanners[0];
                    this.captureFinger();
                } else {
                    alert(response.Message);
                }
            });
    }

    captureFinger(): void {
        this.api
            .httpLocalGet({
                url: `scanner/captureFinger?scannerId=${this.scannerDetails.ScannerId}`,
            })
            .subscribe((response: ICaptureResponse) => {
                this.captureResponse = response;
                this.getEnrolledList();
            });
    }

    getEnrolledList(): void {
        this.api
            .httpGet({
                url: `assessment/getEnrolledList?centreId=${this.verifiedDeviceData.CENTRE_ID}`,
            })
            .subscribe((response: IEnrolledResponse) => {
                if (response.Valid) {
                    this.enrolledList = response.Lines.map((x: IEnrolledList) => ({
                        ...x,
                        IS_VALIDATE: false,
                    }));
                    this.readImpressionsFromDB();
                }
            });
    }

    readImpressionsFromDB(): void {
        const readImpressionSize = 2;
        const readImpressionPayload = [];
        for (let i = 0; i < this.enrolledList.length; i += readImpressionSize) {
            readImpressionPayload.push({
                Lines: this.enrolledList.slice(i, i + readImpressionSize),
                CentreId: this.verifiedDeviceData.CENTRE_ID,
            });
        }
        let index = 0;
        this.processreadImpressionPayload(readImpressionPayload, index);
    }

    processreadImpressionPayload(
        readImpressionPayload: any[],
        index: number
    ): void {
        const payload: IReadImpressionPayload = readImpressionPayload[index];
        if (!payload) {
            return;
        }
        this.readImpression(payload).subscribe(
            (response: IReadImpressionResponse) => {
                if (response.Valid) {
                    const verifyPayload: IVerifyPayload = {
                        Lines: response.Lines,
                        Impression: this.captureResponse.Impression,
                        Quality: this.captureResponse.Quality,
                        Size: this.captureResponse.Size,
                    };
                    this.verifyImpression(verifyPayload).subscribe(
                        (res: IFingerVerifyResponse) => {
                            if (res.Valid) {
                                this.verifiedUserData = res.Data;
                                this.assessmentStatusInfo = {
                                    ...this.assessmentStatusInfo,
                                    LineId: this.verifiedUserData.LINE_ID,
                                    UserType: this.verifiedUserData.USER_TYPE,
                                    LineStatus: Number(deviceStatusEnum.Ready)
                                };
                                this.saveStatus().subscribe((saveSatatusResponse: any) => {
                                    if (saveSatatusResponse.Valid) {
                                        this.loadUserDetails(this.verifiedUserData.LINE_ID)
                                    }
                                })
                            } else {
                                index++;
                                this.processreadImpressionPayload(readImpressionPayload, index);
                            }
                        }
                    );
                }
            }
        );
    }

    readImpression(impressionPayload: IReadImpressionPayload): Observable<any> {
        return this.api.httpPost<IReadImpressionPayload>({
            url: "assessment/readImpressions",
            data: impressionPayload,
        });
    }

    verifyImpression(verifyPayload: IVerifyPayload): Observable<any> {
        return this.api.httpLocalPost<IVerifyPayload>({
            url: "scanner/verifyImpression",
            data: verifyPayload,
        });
    }


    saveStatus(): Observable<any> {
        return this.api.httpPost<any>({ url: "Assessment/saveStatus", data: this.assessmentStatusInfo });
    }

    isSurveyOrExam(deviceLineResponse: IDeviceLine): void {
        /*  debugger;
         if ((deviceLineResponse.USER_TYPE === userTypeEnum.Driver) && (this.configuration.IS_SURVEY)) {
             this.toggleScreen("survey");
         } else {
             this.toggleScreen("exam");
         } */
    }

    submitSurvey($event: any): void {
        console.log($event, 'Survey Submit');
        this.toggleScreen('exam');
    }


    processDeviceData(deviceLineResponse: IDeviceLine): void {
        let deviceLineData = deviceLineResponse;
        if (deviceLineResponse) {
            if (this.assessmentStatusInfo.UserType != deviceLineData.USER_TYPE) {
                if (this.assessmentStatusInfo.LineId <= 0) {
                    this.assessmentStatusInfo = {
                        ...this.assessmentStatusInfo,
                        UserType: deviceLineData.USER_TYPE
                    }
                    this.initExamService();
                }
            }
            if (deviceLineData.EXAM_STATUS == DeviceExamStatus.Reset) {
                this.assessmentStatusInfo.LineStatus = deviceStatusEnum.None;
                this.saveStatus().subscribe((saveSatatusResponse: any) => {
                    if (saveSatatusResponse.Valid) {
                        this.iStatus = deviceStatusEnum.None;
                        this.ResetAll();
                        this.toggleScreen("verify");
                    }
                })
                return;
            } else {
                this.readUserTypeTransLine(deviceLineData).subscribe((userTypeTransResponse: ITranslineResponse) => {
                    this.userTransData = userTypeTransResponse.Data;

                    switch (deviceLineData.LINE_STATUS) {
                        case deviceStatusEnum.Ready:
                            if (this.iStatus !== deviceLineData.LINE_STATUS) {
                                this.loadUserDetails(deviceLineData.LINE_ID);
                            }
                            /* Stop Scanner Service */
                            break;
                        case deviceStatusEnum.Extend:
                            if (this.assessmentStatusInfo.LineId > 0 && userTypeTransResponse.Valid) {
                                const extra = this.userTransData.EXTRA_TIME;
                                if (this.extraTime != extra) {
                                    this.extraTime = extra;
                                    this.ResetDuration();
                                    this.assessmentStatusInfo.LineStatus = deviceStatusEnum.Started;
                                    this.saveStatus().subscribe((saveSatatusResponse: ISaveStatusResponse) => {
                                        if (saveSatatusResponse.Id > 0) {
                                            this.iStatus = deviceStatusEnum.Started;
                                        }
                                    })
                                }
                            }
                            break;
                        case deviceStatusEnum.StartExam:
                            if ((this.iStatus !== deviceLineData.LINE_STATUS) && userTypeTransResponse.Valid) {
                                /*   oExamSrv.LineId = Convert.ToInt32(dr[BaseVars.LineId]);
                                  oExamSrv.DriverId = Convert.ToInt64(dr[BaseVars.DriverId]); */
                                this.assessmentStatusInfo.LineId = this.userTransData.LINE_ID
                                this.assessmentStatusInfo.LineStatus = deviceStatusEnum.Started;
                                this.assessmentStatusInfo.StartTime = new Date();
                                this.saveStatus().subscribe((saveSatatusResponse: ISaveStatusResponse) => {
                                    if (saveSatatusResponse.Id > 0) {
                                        this.iStatus = deviceStatusEnum.Started;
                                        /* ExtraTime = Convert.ToInt32(dr[BaseVars.ExtraTime]);
                                        oExamSrv.StartTime = oInfo.StartTime;  */
                                        /* this.loadQuestions(); */
                                    }
                                })

                            }
                            break;
                        case deviceStatusEnum.EndExam:
                            if (this.iStatus !== deviceLineData.LINE_STATUS) {
                                /* 
                                    Step 1
                                        Show Dialog Message ("Assessment ended by assessor")
                                    Step2
                                        Exam Save Api Call
                                    Step 3
                                        Exam Save Success => Current Status to this.iStatus = deviceStatusEnum.Ended;
                                */
                                this.assessmentStatusInfo.LineStatus = deviceStatusEnum.Ended;
                            }
                            break;
                        case deviceStatusEnum.Detach:
                            if (this.iStatus !== deviceLineData.LINE_STATUS) {
                                this.assessmentStatusInfo.LineStatus = deviceStatusEnum.Detached;
                                this.saveStatus().subscribe((saveSatatusResponse: ISaveStatusResponse) => {
                                    if (saveSatatusResponse.Id > 0) {
                                        this.iStatus = deviceStatusEnum.None;
                                        this.ResetAll();
                                    }
                                })
                            }
                            break;

                        default:
                            break;
                    }

                    if (this.iStatus != deviceLineData.LINE_STATUS) {
                        this.iStatus = deviceLineData.LINE_STATUS;
                    }
                })
            }
        }
    }

    initExamService(): void { }

    UpdateDeviceStatus(): void { }

    ResetAll(): void { }

    ResetDuration(): void {
        if (this.userTransData.LINE_ID > 0) {
            const total = this.extraTime + this.configuration.ASSESSMENT_DURATION_TIMER;
            const timeSecond = total * 60
            this.showTime();
        }
    }

    loadUserDetails(Id: number): void {
        this.loadUserDetailsObservable(Id).subscribe((response: any) => {
            this.readUserProfile = response.Data;
            this.toggleScreen('userDetails');
        })
    }

    loadUserDetailsObservable(Id: number): Observable<any> {
        const profilePayload = {
            Id,
            CultureId: 0,
            UserType: this.assessmentStatusInfo.UserType,
        };
        return this.api.httpPost<any>({ url: "Assessment/readProfile", data: profilePayload });
    }

    readUserTypeTransLine(deviceLineData: IDeviceLine): Observable<any> {
        const profilePayload = {
            Id: deviceLineData.LINE_ID,
            CultureId: 0,
            UserType: this.assessmentStatusInfo.UserType,
        };
        return this.api.httpPost<any>({ url: "Assessment/readUserTypeTransLine", data: profilePayload });
    }

    /* loadQuestions(): void {
        this.readSetting().subscribe((profileSettingsResponse: any) => {
            if (profileSettingsResponse.Valid) {
                const payload: IQuesSettingsPayload = {
                    Id: this.userTransData.LINE_ID,
                    CultureId: 0,
                    UserType: this.verifiedUserData.USER_TYPE,
                    ExamType: examTypeEnum.Written,
                };
                this.api.httpPost<IQuesSettingsPayload>({ url: 'Assessment/readData', data: payload }).pipe(
                    switchMap((response: IExamResponse) => {
                        if (response.Valid === 1 && response.Categories && response.Questions) {
                            const fileArray: any[] = [];

                            const questionsWithCategory = response.Questions.map((question: IQuestion) => {
                                return {
                                    ...question,
                                    category: response.Categories.filter((category: ICategory) => question.QUESTION_CAT_ID === category.CATEGORY_ID)[0]
                                };
                            });
                            questionsWithCategory.forEach((question: IQuestion) => {
                                if (!!question.HAS_IMAGE) {
                                    fileArray.push({ id: question.QUESTION_ID, url: `assessment/getQuestionImage?questionid=${question.QUESTION_ID}`, blob: null });
                                }
                                question.isReview = false;
                                question.Answers.forEach((answer: IAnswer) => {
                                    answer.selected = false;
                                });
                            })

                            const requests = fileArray.map((file: any) => {
                                return this.api.httpGetBlob({ url: file.url }).pipe(
                                    catchError((error: any) => {
                                        return of(null);
                                    })
                                );
                            });

                            return forkJoin(requests).pipe(
                                map((imgResponse: BlobResponse[]) => {
                                    imgResponse.forEach((x, i) => {
                                        fileArray[i].blob = x;
                                    });
                                    questionsWithCategory.forEach((question: IQuestion) => {
                                        if (!!question.HAS_IMAGE) {
                                            const found = fileArray.find((img) => img.id === question.QUESTION_ID);
                                            if (found) {
                                                question.image = found.blob;
                                            }
                                        }
                                    });

                                    return questionsWithCategory;
                                })
                            );
                        } else {
                            return of([]);
                        }
                    })
                ).subscribe((examQuestion: any) => {
                    if ((this.assessmentStatusInfo.UserType === userTypeEnum.Driver) && (this.configuration.IS_SURVEY)) {
                        this.readSurveyData().subscribe((surveyResponse: any) => {
                            if (surveyResponse.Data.length) {
                                this.surveyQuestions = surveyResponse.Data;
                                this.toggleScreen('survey')
                            } else {
                                this.toggleScreen('exam')
                            }
                        })
                    } else {
                        this.toggleScreen('exam');
                    }
                    this.examQuestions = examQuestion;
                    console.log(this.examQuestions);
                });
            }
        });
    } */

    readSetting(): Observable<any> {
        const payloadSettings: IQuesSettingsPayload = {
            Id: this.userTransData.LINE_ID,
            CultureId: 0,
            UserType: this.assessmentStatusInfo.UserType,
            ExamType: examTypeEnum.Written,
        };
        return this.api.httpPost<any>({ url: "Assessment/readSetting", data: payloadSettings });
    }

    readSurveyData(): Observable<any> {
        return this.api.httpGet({ url: `Assessment/readSurvey?lineId=${this.verifiedUserData.LINE_ID}` });
    }

    toggleScreen(screenName: keyof IScreenControls): void {
        for (const key in this.screenControl) {
            if (Object.prototype.hasOwnProperty.call(this.screenControl, key)) {
                this.screenControl[key as keyof IScreenControls] = key === screenName;
            }
        }
    }

    showTime(): void {
        /* TimeSpan value = tsDuration.Subtract(tsCurrent);
        if (value.TotalSeconds > 0)
        {
            string format = string.Empty;
            if (value.Days >= 1)
            {
                format = "d'.'h':'mm':'ss";
            }
            else {
                format = value.Hours >= 1 ? "h':'mm':'ss" : "m':'ss";
            }
            //format = value.Days >= 1 ? "d'.'hh':'mm':'mm" : "mm':'ss";
            lblTime.Content = string.Format("{0}", value.ToString(format));
        }
        else {
            lblTime.Content = "00:00";
        } */
    }













    loadQuestions__Test() {
        const payload: IQuesSettingsPayload = {
            Id: 24220,
            CultureId: 0,
            UserType: 42602,
            ExamType: 31002,
        };
        this.api.httpPost<IQuesSettingsPayload>({ url: 'Assessment/readData', data: payload }).pipe(
            switchMap((response: IExamResponse) => { 
                if (response.Valid && response.Categories && response.Questions) {
                    const fileArray: any[] = [];
                    const questionsWithCategory = response.Questions.map((question: IQuestion, index: number) => {
                        return {
                            ...question,
                            isShow: index === 0 ? true : false,
                            isPrevious: index === 0 ? false : true,
                            isNext: index === response.Questions?.length ? false : true,
                            isAnswered: false,
                            isReview: false,
                            category: response.Categories.find((category: ICategory) => question.QUESTION_CAT_ID === category.CATEGORY_ID)
                        };
                    });

                    questionsWithCategory.forEach((question: any) => {
                        if (!!question.HAS_IMAGE) {
                            fileArray.push({ id: question.QUESTION_ID, url: `assessment/getQuestionImage?questionid=${question.QUESTION_ID}`, blob: null });
                        }
                        // Check for HAS_IMAGE in answers and push file download tasks if present
                        question.Answers.forEach((answer: IAnswer) => {
                            if (!!answer.HAS_IMAGE) {
                                fileArray.push({ id: answer.ID, url: `assessment/getAnswerImage?answerid=${answer.ID}`, blob: null });
                            }
                            answer.selected = false;
                        });
                    });

                    const requests = fileArray.map((file: any) => {
                        return this.api.httpGetBlob({ url: file.url }).pipe(
                            catchError((error: any) => {
                                return of(null);
                            })
                        );
                    });

                    if (requests.length) {
                        return forkJoin(requests).pipe(
                            map((imgResponse: BlobResponse[]) => {
                                imgResponse.forEach((res: any, i) => {
                                    if (res) {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(res);
                                        reader.onloadend = () => {
                                            const base64Image = reader.result as string;
                                            const foundQuestion = questionsWithCategory.find((question: any) => question.QUESTION_ID === fileArray[i].id);
                                            if (foundQuestion) {
                                                foundQuestion.image = base64Image;
                                            } else {
                                                const foundAnswer = questionsWithCategory.find((question: any) => {
                                                    return question.Answers.some((ans: any) => ans.ID === fileArray[i].id);
                                                });
                                                if (foundAnswer) {
                                                    const ansIndex = foundAnswer.Answers.findIndex((ans: any) => ans.ID === fileArray[i].id);
                                                    foundAnswer.Answers[ansIndex].image = base64Image;
                                                }
                                            }
                                        };
                                    }
                                });
                                return questionsWithCategory;
                            }));
                    } else {
                        return of(questionsWithCategory);
                    }


                } else {
                    return of([]);
                }
            })
        ).subscribe((examQuestion: any) => { 
            if ((this.assessmentStatusInfo.UserType === userTypeEnum.Driver) && (this.configuration.IS_SURVEY)) {
                this.readSurveyData().subscribe((surveyResponse: any) => {
                    if (surveyResponse.Data.length) {
                        this.surveyQuestions = surveyResponse.Data;
                        this.toggleScreen('survey');
                    } else {
                        this.toggleScreen('exam');
                    }
                });
            } else {
                this.toggleScreen('exam');
            }
            this.examQuestions = examQuestion;
            console.log(this.examQuestions);
        });
    }

 



    ngOnDestroy(): void {
        this.pingSubscription?.unsubscribe();
        this.deviceUpdateSubscription?.unsubscribe();
        this.assessmentTimesSubscription?.unsubscribe();
        this.ping.stopService();


        this.unSubscribeDeviceLine$.next();
        this.intervalAssessmentScreen$.next();
        this.unSubscribeDeviceLine$.complete();
        this.intervalAssessmentScreen$.complete();
    }
}

/* verifyFinger(): void {
    const data: IVerifyFinger = {
        CentreId: this.verifiedDeviceData.CENTRE_ID,
        Size: this.captureResponse.Size,
        Impression: this.captureResponse.Impression
    }
    this.api.httpPost<IVerifyFinger>({ url: `device/verifyFinger`, data }).subscribe((response: any) => {
        if (response.Valid) {
            console.log(response, 'Scanner: Vefiry Finger response')
        } else {

        }
    })
} */
