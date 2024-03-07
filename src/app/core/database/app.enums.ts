

export const deviceStatusEnum = Object.freeze({
    None: 40601,
    Ready: 40602,
    Extend: 40603,
    StartExam: 40604,
    Started: 40605,
    StartExtend: 40606,
    EndExam: 40607,
    Ended: 40608,
    Detach: 40609,
    Detached: 40610
});

export const DeviceExamStatus = Object.freeze({
    Reset: 40700,
    Free: 40701,
    Ready: 40702,
    Started: 40703
})

export const userTypeEnum = Object.freeze({
    Driver: 42602,
    Trainer: 42603,
});


export const examTypeEnum = Object.freeze({
    Written: 31002
})

export const ConfirmDialog = Object.freeze({
    confirm: 101,
    delete: 102,
    success: 103,
    warning: 104,
    error: 105,
})
