import { IConfiguration, IExamSettings } from "./exam-wrap.interface"

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
    StartTime: string
    EndTime: string
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
    QUESTION_ID: number
    INSPECT_MARK: number
    REMARKS: string
    WEIGHTAGE: number
    GRADE_ID: number
    QUESTION_CAT_ID: number
}

export interface ISaveCategory {
    CATEGORY_ID: number
    WEIGHTAGE: number
    INSPECT_MARK: number
    MIN_FOR_PASS: number
    IS_PASS: number
    INSPECT_MARK_DEVIATION: number
    IS_PREV_TEST: number
}
export interface ISaveCourse {
    COURSE_ID: number
    IS_PASS: number
    INSPECT_MARK: number
    MIN_FOR_PASS: number
}

export interface ISaveImage {
    QUESTION_ID: number
    DOC_NAME: string
}
