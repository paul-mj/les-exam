export const API = Object.freeze({
    device: {
        connectionCheck: 'emiratesId/ping',
        getDeviceInfo: 'scanner/getDeviceInfo',
    },
    scanner: {
        discoverScanners: 'scanner/discoverScanners',
        captureFinger: 'scanner/captureFinger', 
        verifyImpression: 'scanner/verifyImpression'
    },
    Assessment: {
        getObjects: 'Assessment/getObjects',
        verifyDevice: 'Assessment/verifyDevice',
        registerDevice: 'Assessment/registerDevice',
        readDeviceLine: 'Assessment/readDeviceLine',
        updateAddress: 'Assessment/updateAddress',
        saveDeviceStatus: 'Assessment/saveDeviceStatus',
        readConfig: 'Assessment/readConfig',
        saveStatus: 'Assessment/saveStatus',
        readProfile: 'Assessment/readProfile',
        readUserTypeTransLine: 'Assessment/readUserTypeTransLine',
        readData: 'Assessment/readData',
        readSetting: 'Assessment/readSetting',
        readSurvey: 'Assessment/readSurvey',
    },
    assessment: {
        getEnrolledList: 'assessment/getEnrolledList',
        readImpressions: 'assessment/readImpressions',
        getQuestionImage: 'assessment/getQuestionImage',
        getAnswerImage: 'assessment/getAnswerImage',
        writeAuditData: 'assessment/writeAuditData',
    }
    
});
