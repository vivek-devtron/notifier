import fs from 'fs';
import { Event } from '../notification/service/notificationService';

export function getMustacheTemplate(event: Event) {
    if (event.pipelineType === "CI") {
        switch (event.eventTypeId) {
            case 1: return fs.readFileSync("./mustacheTemplate/CITrigger.mustache").toString();
            case 2: return fs.readFileSync("./mustacheTemplate/CISuccess.mustache").toString();
            case 3: return fs.readFileSync("./mustacheTemplate/CIFail.mustache").toString();
        }
    }
    else if (event.pipelineType === "CD") {
        switch (event.eventTypeId) {
            case 1: return fs.readFileSync("./mustacheTemplate/CDTrigger.mustache", "utf8").toString();
            case 2: return fs.readFileSync("./mustacheTemplate/CDSuccess.mustache").toString();
            case 3: return fs.readFileSync("./mustacheTemplate/CDFail.mustache", "utf8").toString();
        }
    }
}