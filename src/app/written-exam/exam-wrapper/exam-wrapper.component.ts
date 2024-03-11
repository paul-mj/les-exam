import { Component } from "@angular/core";
import { CenterComponent } from "../center/center.component";
import { VerifyComponent } from "../verify/verify.component";
import { UserDetailsComponent } from "../user-details/user-details.component";
import { ExamComponent } from "../exam/exam.component";
import { CommonModule, formatDate } from "@angular/common";
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
    IExamSetingsResponse,
    IExamSettings,
    IFingerVerifyResponse,
    ILoader,
    IQuesSettingsPayload,
    IReadDeviceLinePayload,
    IReadImpressionPayload,
    IReadImpressionResponse,
    IReadProfile,
    IReadProfileResponse,
    IReadSettings,
    IRegisterDevice,
    IResponseControl,
    ISaveStatusResponse,
    IScanner,
    IScannerResponse,
    IScreenControls,
    ISurvey,
    ITranslineResponse,
    IUpdateAddress,
    IUserResponse,
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
    last,
    lastValueFrom,
    map,
    mergeMap,
    of,
    switchMap,
    takeUntil,
} from "rxjs";
import { ApiService } from "../../core/services/api/api.service";
import { API } from "../../core/application/api.config";
import { BlobResponse, IAnswer, ICategory, IExamCompleteEmitResponse, IExamResponse, IExamSave, IFinalQUestionResponse, INewExamOrRetest, IOptionSave, IOptionSaveParam, IQuestion, ISaveCategory, ISaveImage, ISaveQuestion } from "../../core/interfaces/exam-interface";
import { ConfirmDialog, DeviceExamStatus, deviceStatusEnum, examTypeEnum, userTypeEnum } from "../../core/database/app.enums";
import { SignalService } from "../../core/services/signal/signal.service";
import { UtilityService } from "../../core/services/utility/utility.service";

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
        ResultComponent
    ],
    templateUrl: "./exam-wrapper.component.html",
    styleUrl: "./exam-wrapper.component.scss",
})
export class ExamWrapperComponent {
    centerList!: ICenter[];
    pingError: any;
    pingErrorScreen: boolean = false;
    screenControl: IScreenControls = {
        center: false,
        verify: false,
        userDetails: false,
        survey: false,
        exam: false,
        summary: false,
        result: false,
    };

    responseControl: IResponseControl = {
        scanner: {
            loader: false,
            isSuccess: false,
            message: ''
        },
        readAndVerifyFinger: {
            loader: true,
            isSuccess: false,
            buttonText: 'Scan Finger',
            image: 0
        },
        userDetails: {
            loader: false,
        },
        examStart: {
            loader: false,
        },
    }


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
    examSettings!: IExamSettings;
    examStartTime!: Date;
    scannerResponse!: IScannerResponse;

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
    examQuestionApiResponse!: IExamResponse;

    pingSubscription!: Subscription;
    deviceUpdateSubscription!: Subscription;
    assessmentTimesSubscription!: Subscription;
    private unSubscribeDeviceLine$ = new Subject<void>();
    private intervalAssessmentScreen$ = new Subject<void>();


    constructor(
        private ping: PingService,
        private api: ApiService,
        private signal: SignalService,
        private utils: UtilityService,

    ) { }

    ngOnInit(): void {
        /* this.loadQuestions__Test(); */
        this.pingChecking();
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
                    this.pingErrorScreen = true;
                    this.utils.openStatusDialog('Error', 'Local service not connectd properly, Please check connection', ConfirmDialog.error).subscribe();
                } else {
                    this.pingErrorScreen = false;
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
            .httpPost({ url: API.Assessment.getObjects, data: getData(objList) })
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
            .httpGet({ url: `${API.Assessment.verifyDevice}?key=${this.deviceInfo.BiosId}` })
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
                url: API.Assessment.registerDevice,
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
            url: API.Assessment.readDeviceLine,
            data,
        });
    }

    verifyAfterNewDeviceRegister(): void {
        this.api
            .httpGet({ url: `${API.Assessment.verifyDevice}?key=${this.deviceInfo.BiosId}` })
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
        this.api.httpPost<IUpdateAddress>({ url: API.Assessment.updateAddress, data })
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
            url: API.Assessment.saveDeviceStatus,
            data,
        });
    }

    readConfig(): void {
        this.api
            .httpGet({ url: API.Assessment.readConfig })
            .subscribe((response: IConfigResponse) => {
                if (response.Valid) {
                    this.configuration = response.Data;
                    this.AssessmentScreenTimer();
                }
            });
    }

    AssessmentScreenTimer(): void {
        const testConfig = {
            "ID": 1,
            "ORAL_WRITTEN_DELAY_MI": 2,
            "SCHEDULE_SELECT_DELAY_DAYS": 0,
            "SCHEDULE_VISIBLE_DAYS": 90,
            "ORAL_DELAY_MI": 1,
            "WRITTEN_DELAY_MI": 0,
            "ATTENDANCE_RANGE_FROM_MI": 1000,
            "ATTENDANCE_RANGE_TO_MI": -1000,
            "MAX_DRIVERS_IN_ONE_BATCH": 30,
            "DRIVER_DOC_VALIDITY_PERIOD_MI": 12,
            "PERMIT_EXPIRY_PERIOD_FOR_RENEW_MI": 3,
            "ASSESSOR_SCREEN_TIMER": 15,
            "ASSESSMENT_SCREEN_TIMER": 15,
            "ASSESSMENT_DURATION_TIMER": 15,
            "ASSESSMENT_RESULT_TIMER": 60,
            "ASSESSMENT_REVIEW_TIMER": 45,
            "ASSESSMENT_MESSAGE_TIMER": 10,
            "ASSESSMENT_DIALOG_TIMER": 20,
            "SEC_CLEARNC_DOC_VALIDITY_MONTHS": 100,
            "ASSESSMENT_MAX_REPEAT_CALLS": 20,
            "ASSESSMENT_REPEAT_CALL_DELAY_MI": 30,
            "REPRINT_LOST_PERMIT_CHARGES": 0,
            "REPRINT_DAMAGED_PERMIT_CHARGES": 0,
            "DLS_SUSPEND_JOB_STATUS": 1,
            "DRIVER_CLEARANCE_CHARGES": 0,
            "OLD_DRIVER_PERMIT_ISSUE_LAST_DATE": "2013-02-01T00:00:00",
            "OLD_DRIVER_SUSPENSION_MONTHS": 3,
            "ASSESMENT_PERMI_ISSUE_MAX_DAYS": 90,
            "ASSESMENT_FAIL_TRNG_COMPLTN_DAYS": 90,
            "SEC_CLRNCE_PENDING_MAX_MONTHS": 2,
            "BLACK_POINT_FOR_SUSPENSION": 36,
            "BLACK_POINT_SUSPENSION_MONTHS": 12,
            "OLD_DRIVER_PERMIT_ISSUE_LAST_DATE_PHC": "2013-02-01T00:00:00",
            "ASSMENT_STATUS_MAIL_DATE": "2015-10-04T00:00:00",
            "DOC_REJECT_SUSPN_DELY_HRS": 120,
            "EXAM_AVG_MONTHS": 6,
            "DOC_EXPIRY_FIRST_ACK_DAYS": 30,
            "DOC_EXPIRY_SECOND_ACK_DAYS": 4,
            "DOC_EXPIRY_MAIL_SENT_DATE": "2015-10-05T05:00:00.81",
            "PROFILE_DATE_FOR_EDU_DOC": "2013-01-13T00:00:00",
            "PROFILE_DATE_FOR_EDU_DOC_PHC": "2013-07-14T00:00:00",
            "WHITE_POINT_CALC_NEXT_DATE": null,
            "LAST_WHITE_POINT_CALC_DATE": null,
            "WHITE_TO_BLACK_CONVR_RATIO": null,
            "WHITE_POINT_VLDTY_MNTHS": 12,
            "AUTO_NEXT_ASSMENT_TRANS": 0,
            "IS_SURVEY": 1,
            "FAIL_LINE_CONNECION_MAX_MONTHS": 6,
            "UP_USER_ID": 2699,
            "UP_DATE": "2024-02-22T10:26:53.013"
        }
        this.configuration = testConfig;
        const seconds: number = this.configuration.ASSESSMENT_SCREEN_TIMER * 1000;
        const intervalAssessmentScreen$ = interval(seconds);
        this.assessmentTimesSubscription = intervalAssessmentScreen$.pipe(
            switchMap(() => this.getReadDeviceLine()),
            map(deviceLineResponse => {
                return deviceLineResponse;
            })
        ).subscribe((deviceLineResponse: IDeviceLineResponse) => {
          /*   debugger; */
            this.processDeviceData(deviceLineResponse.Data);
        });
    }

    initScanner(): void {
        this.responseControl.scanner.loader = true;
        this.api
            .httpLocalGet({ url: API.scanner.discoverScanners })
            .subscribe((response: IScannerResponse) => {
                if (response.Valid) {
                    this.responseControl.scanner.isSuccess = true;
                    this.scannerDetails = response.Scanners[0];
                    this.captureFinger();
                } else {
                    this.responseControl.scanner.isSuccess = false;
                    this.responseControl.scanner.message = response.Message;
                }
                this.scannerResponse = response;
                this.responseControl.scanner.loader = false;
            });
    }

    captureFinger(): void {
        this.responseControl.readAndVerifyFinger.loader = true;
        this.responseControl.readAndVerifyFinger.buttonText = 'Reading Finger';
        this.responseControl.readAndVerifyFinger.image = 2; //blink border
        this.api.httpLocalGet({ url: `${API.scanner.captureFinger}?scannerId=${this.scannerDetails.ScannerId}` })
            .subscribe((response: ICaptureResponse) => {
                if (response.Valid) {
                    this.captureResponse = response;
                    this.getEnrolledList();
                    this.responseControl.readAndVerifyFinger.buttonText = 'Verifying User'; 

                } else {
                    this.utils.openStatusDialog('Error', 'User Verification Failed, Scan Again', ConfirmDialog.error).subscribe();
                    this.responseControl.readAndVerifyFinger.buttonText = 'Scan Finger'; this.responseControl.readAndVerifyFinger.loader = false;
                    this.responseControl.readAndVerifyFinger.image = 0;
                }
                this.responseControl.readAndVerifyFinger.loader = false;

            });
    }

    getEnrolledList(): void {
        this.api
            .httpGet({
                url: `${API.assessment.getEnrolledList}?centreId=${this.verifiedDeviceData.CENTRE_ID}`,
            })
            .subscribe((response: IEnrolledResponse) => {
                if (response.Valid && response.Lines?.length) {
                    this.enrolledList = response.Lines.map((x: IEnrolledList) => ({
                        ...x,
                        IS_VALIDATE: false,
                    }));
                    this.readImpressionsFromDB();
                } else {
                    this.utils.openStatusDialog('Error', 'User Verification Failed, Scan Again', ConfirmDialog.error).subscribe();
                    this.responseControl.readAndVerifyFinger.buttonText = 'Scan Finger'; this.responseControl.readAndVerifyFinger.loader = false
                    this.responseControl.readAndVerifyFinger.image = 0;
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
        this.responseControl.readAndVerifyFinger.loader = true;
        this.processreadImpressionPayload(readImpressionPayload, index);
    }

    processreadImpressionPayload(readImpressionPayload: any[], index: number): void {
        const payload: IReadImpressionPayload = readImpressionPayload[index];
        if (!payload) {
            this.responseControl.readAndVerifyFinger.loader = false;
            return;
        }
        this.readImpression(payload).subscribe((response: IReadImpressionResponse) => {
            if (response.Valid) {
                const verifyPayload: IVerifyPayload = {
                    Lines: response.Lines,
                    Impression: this.captureResponse.Impression,
                    Quality: this.captureResponse.Quality,
                    Size: this.captureResponse.Size,
                };
                this.verifyImpression(verifyPayload).subscribe((res: IFingerVerifyResponse) => {
                    if (res.Valid) {
                        this.verifiedUserData = res.Data;
                        this.assessmentStatusInfo = {
                            ...this.assessmentStatusInfo,
                            LineId: this.verifiedUserData?.LINE_ID,
                            UserType: this.verifiedUserData.USER_TYPE,
                            LineStatus: Number(deviceStatusEnum.Ready)
                        };
                        this.saveStatus().subscribe((saveSatatusResponse: any) => {
                            if (saveSatatusResponse.Valid) {
                                this.loadUserDetails(this.verifiedUserData?.LINE_ID);
                            }
                        });
                        this.responseControl.readAndVerifyFinger.buttonText = 'Fetching Details';
                        this.responseControl.readAndVerifyFinger.image = 3; //image with tick

                    } else {
                        this.responseControl.readAndVerifyFinger.loader = false;
                        this.utils.openStatusDialog('Error', 'User Verification Failed, Scan Again', ConfirmDialog.error).subscribe();
                        this.responseControl.readAndVerifyFinger.buttonText = 'Scan Finger'; this.responseControl.readAndVerifyFinger.loader = false
                        this.responseControl.readAndVerifyFinger.image = 0;

                    }
                }, (error: any) => {
                    this.responseControl.readAndVerifyFinger.loader = false;
                    this.responseControl.readAndVerifyFinger.buttonText = 'Scan Finger'; this.responseControl.readAndVerifyFinger.loader = false
                    this.responseControl.readAndVerifyFinger.image = 0;


                });
            }
        }, (error: any) => {
            this.responseControl.readAndVerifyFinger.loader = false;
            this.responseControl.readAndVerifyFinger.buttonText = 'Scan Finger'; this.responseControl.readAndVerifyFinger.loader = false
            this.responseControl.readAndVerifyFinger.image = 0;


        });
    }


    readImpression(impressionPayload: IReadImpressionPayload): Observable<any> {
        return this.api.httpPost<IReadImpressionPayload>({
            url: API.assessment.readImpressions,
            data: impressionPayload,
        });
    }

    verifyImpression(verifyPayload: IVerifyPayload): Observable<any> {
        return this.api.httpLocalPost<IVerifyPayload>({
            url: API.scanner.verifyImpression,
            data: verifyPayload,
        });
    }


    saveStatus(): Observable<any> {
        return this.api.httpPost<any>({ url: API.Assessment.saveStatus, data: this.assessmentStatusInfo });
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
                let lineStatus: number = deviceLineData.LINE_STATUS;
                let lineId: number = deviceLineData.LINE_ID;

                this.readUserTypeTransLine(lineId).subscribe(async (userTypeTransResponse: ITranslineResponse) => {
                    this.signal.userTypeTransLineData(userTypeTransResponse.Data);
                    this.userTransData = userTypeTransResponse.Data;

                    switch (lineStatus) {
                        case deviceStatusEnum.Ready:
                            if (this.iStatus !== lineStatus) {
                                this.loadUserDetails(lineId);
                            }
                            this.stopScannerDevices();
                            break;
                        case deviceStatusEnum.Extend:
                            if (lineId > 0 && userTypeTransResponse.Valid) {
                                const extraTimeAdded = this.userTransData.EXTRA_TIME;
                                if (this.extraTime != extraTimeAdded) {
                                    this.extraTime = extraTimeAdded;
                                    this.ResetDuration();
                                    this.assessmentStatusInfo.LineStatus = deviceStatusEnum.Started;
                                    /* Need to verify Extra time is added or not */
                                    /* this.saveStatus().subscribe((saveSatatusResponse: ISaveStatusResponse) => {
                                        if (saveSatatusResponse.Id > 0) {
                                            this.iStatus = deviceStatusEnum.Started;
                                        }
                                    }) */
                                    const saveStatus$ = this.saveStatus();
                                    const saveSatatusResponse: ISaveStatusResponse = await lastValueFrom(saveStatus$);
                                    if (saveSatatusResponse.Id > 0) {
                                        this.iStatus = deviceStatusEnum.Started;
                                    }
                                }
                            }
                            break;
                        case deviceStatusEnum.StartExam:
                            if ((this.iStatus !== lineStatus) && userTypeTransResponse.Valid) {
                                /*   oExamSrv.LineId = Convert.ToInt32(dr[BaseVars.LineId]);
                                  oExamSrv.DriverId = Convert.ToInt64(dr[BaseVars.DriverId]); */
                                this.assessmentStatusInfo.LineId = this.userTransData.LINE_ID
                                this.assessmentStatusInfo.LineStatus = deviceStatusEnum.Started;
                                this.assessmentStatusInfo.StartTime = new Date();


                                const saveStatus$ = this.saveStatus();
                                const saveSatatusResponse: ISaveStatusResponse = await lastValueFrom(saveStatus$);
                                if (saveSatatusResponse.Id > 0) {
                                    this.extraTime = this.userTransData.EXTRA_TIME;
                                    this.iStatus = deviceStatusEnum.Started;
                                    /* ExtraTime = Convert.ToInt32(dr[BaseVars.ExtraTime]);
                                    oExamSrv.StartTime = oInfo.StartTime;  */
                                    this.loadQuestions();
                                }
                            }
                            break;
                        case deviceStatusEnum.EndExam:
                            if (this.iStatus !== lineStatus) { 
                                /* 
                                    Step 1
                                        Show Dialog Message ("Assessment ended by assessor")
                                    Step2
                                        Exam Save Api Call
                                    Step 3
                                        Exam Save Success => Current Status to this.iStatus = deviceStatusEnum.Ended;
                                */
                                this.signal.accessorEndExam({ isEnd: true });
                                this.utils.openStatusDialog('Alert', 'Exam has been stopped', ConfirmDialog.forExam).subscribe();
                                this.assessmentStatusInfo.LineStatus = deviceStatusEnum.Ended;
                            }
                            break;
                        case deviceStatusEnum.Detach:
                            if (this.iStatus !== lineStatus) {
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

                    if (this.iStatus != lineStatus) {
                        this.iStatus = lineStatus;
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
            const total = this.extraTime + this.examSettings.EXAM_DURATION;
            // this.configuration.ASSESSMENT_DURATION_TIMER;
            const timeSecond = total * 60
            /* this.showTime(); */
        }
    }

    loadUserDetails(Id: number): void {
        this.loadUserDetailsObservable(Id).subscribe((response: IUserResponse) => {
            if (response.Valid) {
                this.readUserProfile = response.Data;
                this.toggleScreen('userDetails');
            } else {
                this.utils.openStatusDialog('Error', response.ResponseMessage, ConfirmDialog.error).subscribe();
            }
            this.responseControl.userDetails.loader = false;
            this.responseControl.examStart.loader = true;
        })
    }

    loadUserDetailsObservable(Id: number): Observable<any> {
        const profilePayload = {
            Id,
            CultureId: 0,
            UserType: this.assessmentStatusInfo.UserType,
        };
        return this.api.httpPost<any>({ url: API.Assessment.readProfile, data: profilePayload });
    }

    readUserTypeTransLine(lineId: number): Observable<any> {
        const profilePayload = {
            Id: lineId,
            CultureId: 0,
            UserType: this.assessmentStatusInfo.UserType,
        };
        return this.api.httpPost<any>({ url: API.Assessment.readUserTypeTransLine, data: profilePayload });
    }

    loadQuestions(): void {
        this.readSetting().subscribe((profileSettingsResponse: IExamSetingsResponse) => {
            this.examSettings = profileSettingsResponse.Data;
            if (profileSettingsResponse.Valid) {
                const payload: IQuesSettingsPayload = {
                    Id: this.userTransData.LINE_ID,
                    CultureId: 0,
                    UserType: this.verifiedUserData?.USER_TYPE,
                    //UserType: this.verifiedUserData?.USER_TYPE,
                    ExamType: examTypeEnum.Written,
                };

                this.api.httpPost<IQuesSettingsPayload>({ url: API.Assessment.readData, data: payload }).pipe(
                    switchMap((response: IExamResponse) => {
                        if (response.Valid && response.Categories && response.Questions) {
                            this.examQuestionApiResponse = response;
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
                                    fileArray.push({ id: question.QUESTION_ID, url: `${API.assessment.getQuestionImage}?questionid=${question.QUESTION_ID}`, blob: null });
                                }
                                question.Answers.forEach((answer: IAnswer) => {
                                    if (!!answer.HAS_IMAGE) {
                                        fileArray.push({ id: answer.ID, url: `${API.assessment.getAnswerImage}?answerid=${answer.ID}`, blob: null });
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
                        this.gotoDriverView();
                    } else {
                        this.toggleScreen('exam');
                    }
                    this.examQuestions = examQuestion;
                    this.responseControl.examStart.loader = false;
                });

            }
        });
    }

    gotoDriverView(): void {
        this.readSurveyData().subscribe((surveyResponse: any) => {
            if (surveyResponse.Data.length) {
                this.surveyQuestions = surveyResponse.Data;
                this.toggleScreen('survey');
            } else {
                this.toggleScreen('exam');
            }
        });
    }

    readSetting(): Observable<any> {
        const payloadSettings: IQuesSettingsPayload = {
            Id: this.userTransData.LINE_ID,
            CultureId: 0,
            UserType: this.assessmentStatusInfo.UserType,
            ExamType: examTypeEnum.Written,
        };
        return this.api.httpPost<any>({ url: API.Assessment.readSetting, data: payloadSettings });
    }

    readSurveyData(): Observable<any> {
        return this.api.httpGet({ url: `${API.Assessment.readSurvey}?lineId=${this.verifiedUserData.LINE_ID}` });
    }

    toggleScreen(screenName: keyof IScreenControls): void {
        for (const key in this.screenControl) {
            if (Object.prototype.hasOwnProperty.call(this.screenControl, key)) {
                this.screenControl[key as keyof IScreenControls] = key === screenName;
                (screenName === 'exam') && this.isExamScreen();
            }
        }
    }

    isExamScreen(): void {
        this.examStartTime = this.formatDateToenUS(new Date(), 'dd-MMM-yyyy HH:mm:ss')
    }

    loadQuestions__Test() {
        const payload: IQuesSettingsPayload = {
            Id: 24252, //todays Enroll 05-03-2024
            CultureId: 0,
            UserType: 42602,
            ExamType: examTypeEnum.Written,
        };
        this.api.httpPost<IQuesSettingsPayload>({ url: API.Assessment.readData, data: payload }).pipe(
            switchMap((response: IExamResponse) => {
                if (response.Valid && response.Categories && response.Questions) {
                    this.examQuestionApiResponse = response;
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
                            fileArray.push({ id: question.QUESTION_ID, url: `${API.assessment.getQuestionImage}?questionid=${question.QUESTION_ID}`, blob: null });
                        }
                        question.Answers.forEach((answer: IAnswer) => {
                            if (!!answer.HAS_IMAGE) {
                                fileArray.push({ id: answer.ID, url: `${API.assessment.getAnswerImage}?answerid=${answer.ID}`, blob: null });
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
                this.gotoDriverView();
            } else {
                this.toggleScreen('exam');
            }
            this.examQuestions = examQuestion;
            console.log(this.examQuestions);
        });
    }



    individualAnswerSave($event: IOptionSave) {
        const data: IOptionSaveParam = {
            LineId: this.userTransData?.LINE_ID,
            DeviceId: this.assessmentStatusInfo.DeviceId,
            UserType: this.assessmentStatusInfo.UserType,
            ExamType: examTypeEnum.Written,
            QuestionId: $event.question.ID,
            GradeId: $event.selectedOption.ID,
            InspectMark: $event.selectedOption.WEIGHTAGE,
            Remarks: ''
        }
        this.api.httpPost<IOptionSaveParam>({ url: API.assessment.writeAuditData, data }).subscribe();
    }

    onExamComplete($event: IExamCompleteEmitResponse): void {
        console.log($event, 'event data from exam');
        console.log(this.returnActualTime($event), 'this.returnActualTime($event)');
        const driverParam = {
            ActualTime: this.returnActualTime($event),
            Weightage: this.examSettings.WEIGHATGE,
            MinPassMark: this.examSettings.MIN_PASS_MARK,
            Categories: this.formatCategories(),
        }
        const trainerParam = {
            UserId: 0,
            Courses: this.formatCources(),
        }
        const data: IExamSave = {
            LineId: this.userTransData?.LINE_ID,
            ExamType: examTypeEnum.Written,
            StartTime: this.examStartTime,
            EndTime: $event.endTime,
            Remarks: "",
            ...(this.assessmentStatusInfo.UserType === userTypeEnum.Driver ? driverParam : trainerParam),
            Questiones: this.formatQuestions($event.question),
            Images: this.formatImages($event.question),
        }
        console.log(data, 'Exam Save Param');
        const url = (this.assessmentStatusInfo.UserType === userTypeEnum.Driver) ? 'assessment/saveDriverAssessment' : 'assessment/saveTrainerAssessment';
        this.completeExam(data, url)
    }

    returnActualTime(data: any): any {
        const timeObj = { timeStart: data.examTimer, timeEnd: `${this.examSettings.EXAM_DURATION}:00` };
        const actTime = this.timeCalc(timeObj).time;
        return Number(actTime.split(':')[0]);
    }

    formatDateToenUS(date: Date, format: string): any {
        return formatDate(date, format, 'en-US');
    }

    timeCalc(arg: any): any {
        console.log(arg, 'argument');
        const [tsm, tss] = arg.timeStart.split(':');
        const [tem, tes] = arg.timeEnd.split(':');
        const tsms = ((Number(tsm) * 60) + Number(tss)) * 1000;
        const tems = ((Number(tem) * 60) + Number(tes)) * 1000;
        let milliseconds = tems - tsms;
        if (arg.operator === '+') {
            milliseconds = tems + tsms;
        }
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Number(((milliseconds % 60000) / 1000).toFixed(0));
        const time = `${minutes}:${(seconds < 10 ? '0' : '')} ${seconds}`;
        return {
            milliseconds,
            seconds,
            minutes,
            time
        };
    }

    completeExam(data: IExamSave, url: string): void { 
         this.api.httpPost<IExamSave>({ url, data }).subscribe((res: any) => {
            if (res.Id > 0) { 
                debugger;
                this.toggleScreen('result');
                this.iStatus = deviceStatusEnum.EndExam;
            }
             console.log(res, 'complete exam final call');
         }) 

    }


    toRetestOrRenew(event: INewExamOrRetest) {  
        if (event.isRetest) {
            this.AssessmentScreenTimer();
        } else {
            this.resetAllForNewUser().then(() => {
                this.pingChecking();
            }).catch((error) => {
                console.error("Error resetting variables:", error);
            });
        }
    }
 


    resetAllForNewUser(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.centerList = [];
            this.pingError = null;
            this.screenControl = {
                center: false,
                verify: false,
                userDetails: false,
                survey: false,
                exam: false,
                summary: false,
                result: false,
            };

            this.responseControl = {
                scanner: {
                    loader: false,
                    isSuccess: false,
                    message: ''
                },
                readAndVerifyFinger: {
                    loader: true,
                    isSuccess: false,
                    buttonText: 'Scan Finger',
                },
                userDetails: {
                    loader: false,
                },
                examStart: {
                    loader: false,
                },
            };

            this.deviceInfo = {} as IDeviceInfo;
            this.verifiedDeviceData = {} as IVerifyDevice;
            this.configuration = {} as IConfiguration;
            this.scannerDetails = {} as IScanner;
            this.captureResponse = {} as ICaptureResponse;
            this.enrolledList = [] as IEnrolledList[];
            this.verifiedUserData = {} as IVerifiedUserData;
            this.readSettings = {} as IReadSettings;
            this.readUserProfile = {} as IReadProfile;
            this.surveyQuestions = {} as ISurvey;
            this.userTransData = {} as TransLine;
            this.examSettings = {} as IExamSettings;
            this.examStartTime = {} as Date;
            this.assessmentStatusInfo = {
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
            this.iStatus = {} as number;
            this.extraTime = {} as number;
            this.examQuestions = {} as IFinalQUestionResponse;
            this.examQuestionApiResponse = {} as IExamResponse;
            resolve();
        });
    }


    formatQuestions(question: IQuestion[]): ISaveQuestion[] {
        return question.map((ques: IQuestion) => ({
            QuestionId: ques.QUESTION_ID,
            QuestionCatId: ques.QUESTION_CAT_ID,
            InspectMark: ques.INSPECT_MARK,
            Remarks: ques.REMARKS,
            Weightage: this._selectedAnswerWeightage(ques.Answers) ? this._selectedAnswerWeightage(ques.Answers) : 0,
            GradeId: this._selectedAnswerId(ques.Answers) ? this._selectedAnswerId(ques.Answers) : -1
        }));
    }

    formatCategories(): ISaveCategory[] {
        return this.examQuestionApiResponse.Categories.map((category: ICategory) => ({
            CategoryId: category.CATEGORY_ID,
            Weightage: category.WEIGHTAGE,
            InspectMark: category.INSPECT_MARK,
            MinForPass: category.MIN_PASS_MARK,
            IsPass: category.IS_PASS,
            IsPrevTest: category.IS_PREV_TEST,
            InspectMarkDeviation: category.INSPECT_MARK_DEVIATION
        }));
    }
    formatCources(): any {
        /* return this.examQuestionApiResponse.Categories.map((category: ICategory) => ({
            COURSE_ID: category.COURSE_ID,
            IS_PASS: category.IS_PASS,
            INSPECT_MARK: category.INSPECT_MARK,
            MIN_FOR_PASS: category.MIN_PASS_MARK, 
        })); */
    }


    formatImages(question: IQuestion[]): ISaveImage[] {
        let imageArray: ISaveImage[] = [];
        question.map((ques: IQuestion) => {
            if (ques.HAS_IMAGE === 1) {
                imageArray.push({
                    QuestionId: ques.QUESTION_ID,
                    DocName: ques.FILE_EXTENSION
                });
            }
        })
        return imageArray;
    }

    _selectedAnswerId(answers: IAnswer[]): number {
        let GradeId: any;
        answers.map((answer: IAnswer) => {
            if (answer.selected) {
                GradeId = answer.ID;
            }
        });
        return GradeId;
    }

    _selectedAnswerWeightage(answers: IAnswer[]): number {
        let weightage: any;
        answers.map((answer: IAnswer) => {
            if (answer.selected) {
                weightage = answer.WEIGHTAGE;
            }
        });
        return weightage;
    }

    stopScannerDevices(): void {
        this.pingSubscription?.unsubscribe();
        this.ping.stopService();
    }

    ngOnDestroy(): void {
        this.stopScannerDevices();
        this.deviceUpdateSubscription?.unsubscribe();
        this.assessmentTimesSubscription?.unsubscribe();
        this.unSubscribeDeviceLine$.next();
        this.intervalAssessmentScreen$.next();
        this.unSubscribeDeviceLine$.complete();
        this.intervalAssessmentScreen$.complete();
    }
}

