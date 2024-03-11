export interface IScreenControls {
    center: boolean;
    verify: boolean;
    userDetails: boolean;
    survey: boolean;
    exam: boolean;
    summary: boolean;
    result: boolean;
}

export interface IResponseControl {
    scanner: ILoader 
    readAndVerifyFinger: ILoader
    userDetails: ILoader
    examStart: ILoader
}
 
export interface ILoader {
    isSuccess?: boolean
    buttonText?: string
    loader: boolean 
    message?: string 
    image?: number 
}


export interface IDeviceInfo {
    BiosId: string;
    IP4Address: string;
    MacAddress: string;
    MachineName: string;
}

export interface IRegisterDevice {
    DeviceIp: string,
    DeviceKey: string,
    CentreId: number | null,
    DeviceId: null,
    DeviceName: string,
    IsActive: number
}

export interface ICenter {
    FilterId: number,
    Id: number,
    ParentId: number,
    Code: string,
    Description: string
    active?: boolean
}

export interface IUpdateAddress {
    DeviceIp: string,
    DeviceKey: string,
}

export interface IConfigResponse {
    Data: IConfiguration
    Valid: boolean
    ResponseMessage: string
}

export interface IConfiguration {
    ID: number
    ORAL_WRITTEN_DELAY_MI: number
    SCHEDULE_SELECT_DELAY_DAYS: number
    SCHEDULE_VISIBLE_DAYS: number
    ORAL_DELAY_MI: number
    WRITTEN_DELAY_MI: number
    ATTENDANCE_RANGE_FROM_MI: number
    ATTENDANCE_RANGE_TO_MI: number
    MAX_DRIVERS_IN_ONE_BATCH: number
    DRIVER_DOC_VALIDITY_PERIOD_MI: number
    PERMIT_EXPIRY_PERIOD_FOR_RENEW_MI: number
    ASSESSOR_SCREEN_TIMER: number
    ASSESSMENT_SCREEN_TIMER: number
    ASSESSMENT_DURATION_TIMER: number
    ASSESSMENT_RESULT_TIMER: number
    ASSESSMENT_REVIEW_TIMER: number
    ASSESSMENT_MESSAGE_TIMER: number
    ASSESSMENT_DIALOG_TIMER: number
    SEC_CLEARNC_DOC_VALIDITY_MONTHS: number
    ASSESSMENT_MAX_REPEAT_CALLS: number
    ASSESSMENT_REPEAT_CALL_DELAY_MI: number
    REPRINT_LOST_PERMIT_CHARGES: number
    REPRINT_DAMAGED_PERMIT_CHARGES: number
    DLS_SUSPEND_JOB_STATUS: number
    DRIVER_CLEARANCE_CHARGES: number
    OLD_DRIVER_PERMIT_ISSUE_LAST_DATE: string
    OLD_DRIVER_SUSPENSION_MONTHS: number
    ASSESMENT_PERMI_ISSUE_MAX_DAYS: number
    ASSESMENT_FAIL_TRNG_COMPLTN_DAYS: number
    SEC_CLRNCE_PENDING_MAX_MONTHS: number
    BLACK_POINT_FOR_SUSPENSION: number
    BLACK_POINT_SUSPENSION_MONTHS: number
    OLD_DRIVER_PERMIT_ISSUE_LAST_DATE_PHC: string
    ASSMENT_STATUS_MAIL_DATE: string
    DOC_REJECT_SUSPN_DELY_HRS: number
    EXAM_AVG_MONTHS: number
    DOC_EXPIRY_FIRST_ACK_DAYS: number
    DOC_EXPIRY_SECOND_ACK_DAYS: number
    DOC_EXPIRY_MAIL_SENT_DATE: string
    PROFILE_DATE_FOR_EDU_DOC: string
    PROFILE_DATE_FOR_EDU_DOC_PHC: string
    WHITE_POINT_CALC_NEXT_DATE: any
    LAST_WHITE_POINT_CALC_DATE: any
    WHITE_TO_BLACK_CONVR_RATIO: any
    WHITE_POINT_VLDTY_MNTHS: number
    AUTO_NEXT_ASSMENT_TRANS: number
    IS_SURVEY: number
    FAIL_LINE_CONNECION_MAX_MONTHS: number
    UP_USER_ID: any
    UP_DATE: any
}

export interface IScannerResponse {
    Scanners: IScanner[]
    Code: any
    Message: any
    Valid: boolean
}

export interface IScanner {
    ScannerId: string
    Serial: string
    Company: string
}

export interface ICaptureResponse {
    Impression: string
    Quality: number
    Size: number
    Code: any
    Message: any
    Valid: boolean
}

export interface IVerifyFinger {
    CentreId: number
    Size: number
    Impression: string
}

export interface IVerifyDeviceResponse {
    Data: IVerifyDevice
    Valid: boolean
    ResponseMessage: string
}

export interface IVerifyDevice {
    DEVICE_ID: number
    DEVICE_KEY: string
    DEVICE_NAME: string
    DEVICE_IP: string
    CENTRE_ID: number
    DEVICE_STATUS: number
    IS_ACTIVE: number
    LINE_ID: number
    LINE_STATUS: number
    EXAM_STATUS: number
    USER_ID: number
    UPDATED_TIME: string
    STATUS_TIME: any
    USER_TYPE: number
}

export interface IEnrolledResponse {
    Lines: IEnrolledList[]
    Valid: boolean
    Message: any
}

export interface IEnrolledList {
    LINE_ID: number
    USER_TYPE: number
    EXAM_USER_ID: number,
    IS_VALIDATE?: boolean
}

export interface IReadImpressionPayload {
    Lines: IReadImpression[]
    CentreId: number
}

export interface IReadImpressionResponse {
    Lines: IReadImpression[]
    Valid: boolean
    Message: any
}

export interface IReadImpression {
    IMPRESSION_1: string
    IMPRESSION_2: string
    LINE_ID: number
    USER_TYPE: number
    EXAM_USER_ID: number
}

export interface IVerifyPayload {
    Lines: IVerifyLines[]
    Impression: string
    Quality: string | number
    Size: string | number
}

export interface IVerifyLines {
    IMPRESSION_1: string
    IMPRESSION_2: string
    LINE_ID: number
    USER_TYPE: number
    EXAM_USER_ID: number
}

export interface IFingerVerifyResponse {
    Data: IVerifiedUserData
    Code: any
    Message: string
    Valid: boolean
}

export interface IVerifiedUserData {
    LINE_ID: number
    USER_TYPE: number
    EXAM_USER_ID: number
}

export interface IReadDeviceLinePayload {
    Id: number
    CultureId: number
}


export interface IReadSettings {
    Data: IReadSettings
    Valid: boolean
    ResponseMessage: string
}

export interface IReadSettings {
    QUESTIONAIRE_ID: number
    IS_EXAM: number
    EXAM_DURATION: number
    MIN_PASS_MARK: number
    WEIGHATGE: number
}

export interface IReadProfileResponse {
    Data: IReadProfile
    Valid: boolean
    ResponseMessage: string
}

export interface IVerifyInput { 
    blockControl: IResponseControl
    scannerDetails: IScannerResponse
}


export interface UserInput {
    profileDetails: IReadProfile,
    blockControl: IResponseControl
}

export interface IReadProfile {
    DRIVER_NAME_EN: string
    DRIVER_NAME_AR: string
    DRIVER_DOB: string
    DRIVER_PASSPORT_NO: string
    DRIVER_PROFILE_ID: number
    PERMIT_NO: number
    LICENSE_NO: string
    LICENSE_EXPIRY_DATE: string
    PERMIT_EXPIRY_DATE: string
    DRIVER_MOBILE_NO: string
    UPLOAD_PHOTO_DOC_NAME: string
    UPLOAD_PHOTO_EXTENSION: string
    ORAL_PHOTO_DOC_NAME: string
    ORAL_PHOTO_EXTENSION: string
    PERMIT_VALIDITY: string
    ENROLL_ID: number
    SERVICE_TYPE: string
    VEHICLE_TYPE: string
    FRANCHISE_NAME: string
}

export interface ISurvey {
    QST_ID: number
    OPT_1: number
    OPT_2: number
    OPT_3: number
    OPT_4: number
    OBJECT_NAME: string
    OBJECT_NAME_ARABIC: string
}


export interface IAssessmentStatusInfo {
    LineId: number,
    CentreId: number,
    DeviceId: number,
    UserId: number,
    LineStatus: number,
    StartTime: null | Date,
    ExtraTime: number,
    UserType: number,
    ExtraRemarks: string,
    EndRemarks: string,
    Table: null,
}

export interface IDeviceLineResponse {
    Data: IDeviceLine
    Valid: boolean
    ResponseMessage: string
}

export interface IDeviceLine {
    DEVICE_ID: number
    CENTRE_ID: number
    LINE_ID: number
    LINE_STATUS: number
    EXAM_STATUS: number
    USER_TYPE: number
}



export interface IQuesSettingsPayload {
    Id: Number,
    CultureId: Number,
    UserType: Number,
    ExamType: Number,
};


export interface ITranslineResponse {
    Data: TransLine
    Valid: boolean
    ResponseMessage: string
}

export interface TransLine {
    LINE_ID: number
    DRIVER_ID: number
    EXTRA_TIME: number
    START_TIME: any
}


export interface ISaveStatusResponse {
    Id: number
    Value: number
    Message: string
    HasIdParam: boolean
    HasValueParam: boolean
    HasMessageParam: boolean
}


export interface IExamSetingsResponse {
    Data: IExamSettings
    Valid: boolean
    ResponseMessage: string
  }
  
  export interface IExamSettings {
    QUESTIONAIRE_ID: number
    IS_EXAM: number
    EXAM_DURATION: number
    MIN_PASS_MARK: number
    WEIGHATGE: number
  }
  


  export interface IUserResponse {
    Data: IUserData
    Valid: boolean
    ResponseMessage: string
  }
  
  export interface IUserData {
    DRIVER_NAME_EN: string
    DRIVER_NAME_AR: string
    DRIVER_DOB: string
    DRIVER_PASSPORT_NO: string
    DRIVER_PROFILE_ID: number
    PERMIT_NO: number
    LICENSE_NO: string
    LICENSE_EXPIRY_DATE: string
    PERMIT_EXPIRY_DATE: string
    DRIVER_MOBILE_NO: string
    UPLOAD_PHOTO_DOC_NAME: string
    UPLOAD_PHOTO_EXTENSION: string
    ORAL_PHOTO_DOC_NAME: string
    ORAL_PHOTO_EXTENSION: string
    PERMIT_VALIDITY: string
    ENROLL_ID: number
    SERVICE_TYPE: string
    VEHICLE_TYPE: string
    FRANCHISE_NAME: string
  }
  