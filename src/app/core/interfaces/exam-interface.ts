import { IConfiguration, IExamSettings, IResponseControl } from "./exam-wrap.interface"

export interface IExamResponse {
    Categories: ICategory[]
    Questions: IQuestion[]
    Valid: number
    Message: string
}

export type IFinalQUestionResponse = IQuestion[]


export interface ICategory {
    OBJECT_CODE: string
    OBJECT_NAME: string
    OBJECT_NAME_ARABIC: string
    ID: number
    QUESTIONAIRE_ID: number
    EXAM_TYPE: number
    CATEGORY_ID: number
    NO_OF_QUESTIONS: number
    WEIGHATGE: number
    MIN_PASS_MARK: number
    EXAM_DURATION: number
    USER_ID: number
    UPDATED_TIME: string
    MIN_MARK_FOR_NO_RE_EXAM: number
    CAT_NAME: string
    MIN_FOR_PASS: number
    INSPECT_MARK: number
    INSPECT_MARK_DEVIATION: number
    IS_PASS: number
    REMARKS: string
    WEIGHTAGE: number
    IS_PREV_TEST: number
    ASSESSMENT_TIME: string
}

export interface IQuestion {
    ID: number
    QUESTION_ID: number
    QUESTION_CAT_ID: number
    QUESTION_CODE: string
    QUESTION_NAME: string
    QUESTION_CODE_AR: string
    QUESTION_NAME_AR: string
    REMARKS: string
    IS_ACTIVE: number
    ZONE_ID?: number
    QUESTION_TYPE: number
    IS_MAP: number
    IS_MANDATORY: number
    MASTER_ID: number
    FRANCHISE_ID: any
    ORAL_EXAM_TIME_MI: number
    COURSE_ID: any
    CHAPTER_ID: number
    STATUS_ID: number
    GRADE_ID: number
    STATUS_REMARKS: any
    WEIGHTAGE: number
    INSPECT_MARK: number
    CAT_NAME: string
    MAP_EXTENT: string
    FILE_EXTENSION: string
    HAS_IMAGE: number
    Answers: IAnswer[]
    image?: string
    category: ICategory,
    isReview: boolean,
    isShow: boolean,
    isPrevious: boolean,
    isNext: boolean,
    isAnswered: boolean,
}

export interface IAnswer {
    ID: number
    QUESTION_ID: number
    IS_MARKED: number
    ANSWER_NAME: string
    GRADE_NAME: string
    GRADE_NAME_AR: string
    MAP_POINTS: string,
    WEIGHTAGE: number
    FILE_EXTENSION: any
    HAS_IMAGE: number
    points?: MapPoints
    selected?: boolean
    image?: string
}
export interface MapPoints {
    type: string;
    x: number;
    y: number;
    spatialReference: number;
}

export interface BlobResponse {
    data: Blob;
}


export interface IExamChildInput {
    questions: IFinalQUestionResponse;
    examConfig: IConfiguration
    examSetting: IExamSettings
    blockControl: IResponseControl
}


export interface ISummaryDialogResponse {
    toQuestion: boolean
    dialogClose: boolean
    isComplete: boolean
    question?: IQuestion
}


export interface IExamCompleteEmitResponse {
    question: IFinalQUestionResponse,
    examTimer: any,
    endTime: any
}

export interface IOptionSave {
    currentOptions: IAnswer[]
    selectedOption: IAnswer
    question: IQuestion
}

export interface IOptionSaveParam {
    LineId: number,
    DeviceId: number,
    UserType: number,
    ExamType: number,
    QuestionId: number,
    GradeId: number,
    InspectMark: number,
    Remarks: string
}

export interface IExamSave {
    LineId: number
    ExamType: number
    StartTime: Date
    EndTime: Date
    Remarks: string
    ActualTime?: number
    Weightage?: number
    MinPassMark?: number
    UserId?: number
    Questiones: ISaveQuestion[]
    Categories?: ISaveCategory[]
    Courses?: ISaveCourse[]
    Images: ISaveImage[]
}


export interface ISaveQuestion {
    QuestionId: number
    InspectMark: number
    Remarks: string
    Weightage: number
    GradeId: number
    QuestionCatId: number
}

export interface ISaveCategory {
    CategoryId: number
    Weightage: number
    InspectMark: number
    MinForPass: number
    IsPass: number
    InspectMarkDeviation: number
    IsPrevTest: number
}
export interface ISaveCourse {
    COURSE_ID: number
    IS_PASS: number
    INSPECT_MARK: number
    MIN_FOR_PASS: number
}

export interface ISaveImage {
    QuestionId: number
    DocName: string
}

export interface INewExamOrRetest {
    isRetest: boolean
}


export interface IExamSaveResponse {
    categoryResult: IResultPostParam
    result: ExamDetails
    nextExam: []
}

export interface IResultPostParam {
    LineId: number,
    CultureId: number,
    Mode: number
} 

export interface INextExamParam {
    LineId: number,
    CentreId: number,
    CultureId: number,
}

export interface IExamResult {
    Valid: number
    Message: any
    Data: Data
    LineDetails: LineDetails[]
    ExamDetails: ExamDetails[]
}

export interface Data {
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

export interface LineDetails {
    LINE_ID: number
    DRIVER_ID: number
    DRIVER_NAME_AR: string
    DRIVER_NAME_EN: string
    PASSPORT_NO: string
    DRIVER_PROFILE_ID: number
    PERMIT_NO: number
    LICENSE_NO: string
    LICENSE_EXPIRY_DATE: string
    PERMIT_EXPIRY_DATE: string
    LINE_ID1: number
    TRANS_ID: number
    PROFILE_ID: number
    REMARKS: string
    ORAL_ASSESSOR_ID: any
    WRITTEN_ASSESSOR_ID: number
    ACT_ORAL_ASSEMENT_START_TIME: any
    ACT_ORAL_ASSEMENT_END_TIME: any
    ACT_WRITTEN_ASSEMENT_START_TIME: string
    ACT_WRITTEN_ASSEMENT_END_TIME: string
    ORAL_ASSMNT_MARKS: any
    WRITTEN_ASSMNT_MARKS: number
    ORAL_ASSMNT_REMARKS: any
    IS_PASSED: number
    MIN_PASS_MARK: any
    PERMIT_ISSUE_DATE: any
    PERMIT_EXPIRY_DATE1: any
    SUBMITTED_TIME: any
    STATUS_ID: number
    STATUS_USER_ID: number
    STATUS_TIME: string
    STATUS_REMARKS: string
    IS_CLOSED: number
    CLOSED_TIME: any
    LAST_RENEW_DATE: any
    SCH_ORAL_ASSEMENT_START_TIME: any
    SCH_ORAL_ASSEMENT_END_TIME: any
    SCH_WRITTEN_ASSEMENT_START_TIME: string
    SCH_WRITTEN_ASSEMENT_END_TIME: string
    SCH_ORAL_TIME: number
    SCH_WRITTEN_TIME: number
    ORAL_SEQ_ID: any
    WRITTEN_SEQ_ID: number
    ORAL_STATUS_ID: number
    WRITTEN_STATUS_ID: number
    ORAL_ASSMNT_DET_ID: any
    WRITTEN_ASSMNT_DET_ID: number
    INSPECT_MARK: number
    ASSEMENT_REMARKS: string
    PERMIT_VALIDITY: number
    IS_ORAL_TEST: number
    IS_WRITTEN_TEST: number
    IS_RE_TEST: number
    PREV_FAIL_COUNT: number
    FAIL_LINE_ID: any
    IS_ORAL_PASSED: number
    IS_WRITTEN_PASSED: number
    QUESTIONAIRE_ID: number
    IS_IN_RESUBMIT_STAGE: number
    UPLOAD_PHOTO_DOC_NAME: string
    UPLOAD_PHOTO_EXTENSION: string
    ORAL_PHOTO_DOC_NAME: any
    ORAL_PHOTO_EXTENSION: any
    DRIVER_MOBILE_NO: string
    IS_DRIVER_MOB_CHANGED: number
    DEVICE_ID: number
    EXTRA_TIME: number
    EXTRA_TIME_REMARKS: string
    FORCE_END_REMARKS: string
    WRITTEN_ASSMNT_REMARKS: string
    PERMIT_CHARGES: number
    ETRANS_PermitAssessment_ID: any
    ORAL_CALL_COUNT: number
    ORAL_CALL_DELAY_MI: number
    ORAL_CALL_GUID: any
    DRIVER_TYPE: number
    IS_DIRECT_PERMIT: number
    ZONE_ID: number
    REQ_ORAL_ASSEMENT_START_TIME: any
    REQ_WRITTEN_ASSEMENT_START_TIME: any
    SMS_SENT: number
    SMS_SENT_TIME: any
    IS_SEQ_EXAM_PART: number
    IS_SEQ_ORIGIN: number
    SEQ_ORIGIN_LINE_ID: number
    IS_SEQ_COMPLETED: number
    FINAL_MARK: number
    FINAL_MARK_REMARKS: any
    CUR_SEQ_SORT_ORDER: number
    NEXT_SEQ_SORT_ORDER: number
    SEQ_EXAM_COMPLETED_TIME: any
    MULTI_EXAM_STATUS_ID: number
    PERMIT_TYPE: number
    PERMIT_CONFIG_ID: number
    ASSESSMENT_CONFIG_ID: number
    IS_ASSESSMENT: number
    PERMIT_REQ_WF_ID: number
    DOC_CONFIG_ID: number
    CUR_PERMIT_TYPE: number
    IS_ASSMENT_MULTI_LEVEL: number
    IS_WEB_TRANS: number
    WRITTEN_START_USER_ID: number
    IS_CLOSE_ON_TRNF_HIRE: number
    TRNF_HIRE_TRANS_ID: any
    PASS_STATUS: string
    CUR_STATUS_NAME: string
    FRANCHISE_NAME: string
    SERVICE_TYPE_NAME: string
    VEHICLE_TYPE_NAME: string
    RE_TEST_DATE: string
}

export interface ExamDetails {
    ID_: number
    "Exam Type": string
    Required: string
    Status: string
    Passed: string
    Mark: number
    "Pass Mark": number
    Weightage: number
    "Start Time": string
    "End Time": string
    IS_FINISHED_: number
    IS_PASSED_: number
}

export interface IExamCategoryResult {
    Data: IResultCat[]
}

export interface IResultCat {
    ID_: number
    Category: string
    Mark: number
    Deviation: number
    "Pass Mark": number
    Weightage: number
    Date: string
    Passed: string
    IS_PASS: number
}
