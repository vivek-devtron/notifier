import fs from 'fs';
import { Event } from '../notification/service/notificationService';

export function getMustacheTemplate(event: Event) {
    if (event.pipelineType === "CI") {
        switch (event.eventTypeId) {
            case 1: return fs.readFileSync("src/tests/mustacheTemplate/CITrigger.mustache").toString();
            case 2: return fs.readFileSync('src/tests/mustacheTemplate/CISuccess.mustache').toString();
            case 3: return fs.readFileSync("src/tests/mustacheTemplate/CIFail.mustache").toString();
        }
    }
    else if (event.pipelineType === "CD") {
        switch (event.eventTypeId) {
            case 1: return fs.readFileSync("src/tests/mustacheTemplate/CDTrigger.mustache").toString();
            case 2: return fs.readFileSync("src/tests/mustacheTemplate/CDSuccess.mustache").toString();
            case 3: return fs.readFileSync("src/tests/mustacheTemplate/CDFail.mustache").toString();
        }
    }
}