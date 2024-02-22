export const API = Object.freeze({
    device: {
        connectionCheck: 'emiratesId/ping',
        getDeviceInfo: 'scanner/getDeviceInfo',
    },
    scanner: {
        discoverScanners: 'discoverScanners',
        captureFinger: 'captureFinger', 
        verifyImpression: 'verifyImpression'
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
        getEnrolledList: 'getEnrolledList',
        readImpressions: 'readImpressions',
        getQuestionImage: 'getQuestionImage',
        getAnswerImage: 'getAnswerImage',
        writeAuditData: 'writeAuditData',
    }
    
});
