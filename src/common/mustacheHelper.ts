import { Event } from '../notification/service/notificationService';
import moment from 'moment-timezone';
import e from 'express';

export class MustacheHelper {
    private CD_STAGE = {
        DEPLOY: "Deployment",
        PRE: "Pre-deployment",
        POST: "Post-deployment",
    }

    createGitCommitUrl(url: string, revision: string): string {
        if (!url || !revision) {
            return ""
        }
        if (url.indexOf("gitlab") > 0 || url.indexOf("github") > 0) {
            let urlpart = url.split("@")
            if (urlpart.length > 1) {
                return "https://" + urlpart[1].split(".git")[0] + "/commit/" + revision
            }
            if (urlpart.length == 1) {
                return urlpart[0].split(".git")[0] + "/commit/" + revision
            }
        }
        if (url.indexOf("bitbucket") > 0) {
            let urlpart = url.split("@")
            if (urlpart.length > 1) {
                return "https://" + urlpart[1].split(".git")[0] + "/commits/" + revision
            }
            if (urlpart.length == 1) {
                return urlpart[0].split(".git")[0] + "/commits/" + revision
            }
        }
        return "NA"
    }

    parseEvent(event: Event): ParsedCIEvent | ParsedCDEvent {
        let date = moment(event.eventTime);
        let timestamp = date.format("ddd DD MMM YYYY HH:mm a");
        let baseURL = event.baseUrl;
        let material = event.payload.material;
        let ciMaterials = material.ciMaterials ? material.ciMaterials.map((ci) => {
            if (material && material.gitTriggers && material.gitTriggers[ci.id]) {
                let trigger = material.gitTriggers[ci.id];
                let _material;
                if (ci.type == 'WEBHOOK'){
                    let _webhookData = trigger.webhookData;
                    _material = {
                        type : ci.type,
                        webhookData : {
                            eventActionType : _webhookData.eventActionType,
                            data: _webhookData.data
                        }
                    }
                }else{
                    _material = {
                        branch: ci.value || "NA",
                        commit: trigger.Commit ? trigger.Commit.substring(0, 8) : "NA",
                        commitLink: this.createGitCommitUrl(ci.url, trigger.Commit),
                        type : ci.type
                    }
                }
                return _material;
            }
            else {
                return {
                    branch: "NA",
                    commit: "NA",
                    commitLink: "#",
                }
            }
        }) : [];
        if (event.pipelineType === "CI") {
            let buildHistoryLink;
            if (baseURL && event.payload.buildHistoryLink) buildHistoryLink = `${baseURL}${event.payload.buildHistoryLink}`;
            return {
                eventTime: timestamp,
                triggeredBy: event.payload.triggeredBy || "NA",
                appName: event.payload.appName || "NA",
                pipelineName: event.payload.pipelineName || "NA",
                ciMaterials: ciMaterials,
                buildHistoryLink: buildHistoryLink
            }
        }
        else if (event.pipelineType === "CD") {
            let appDetailsLink, deploymentHistoryLink;
            let index = -1;

            if (event.payload.dockerImageUrl) index = event.payload.dockerImageUrl.indexOf(":");
            if (baseURL && event.payload.appDetailLink) appDetailsLink = `${baseURL}${event.payload.appDetailLink}`;
            if (baseURL && event.payload.deploymentHistoryLink) deploymentHistoryLink = `${baseURL}${event.payload.deploymentHistoryLink}`;

            return {
                eventTime: timestamp,
                triggeredBy: event.payload.triggeredBy || "NA",
                appName: event.payload.appName || "NA",
                envName: event.payload.envName || "NA",
                pipelineName: event.payload.pipelineName || "NA",
                stage: this.CD_STAGE[event.payload.stage] || "NA",
                ciMaterials: ciMaterials,
                dockerImg: index >= 0 ? event.payload.dockerImageUrl.substring(index + 1) : "NA",
                appDetailsLink: appDetailsLink,
                deploymentHistoryLink: deploymentHistoryLink,
            }
        }
    }
}

//For Slack
interface ParsedCIEvent {
    eventTime: string;
    triggeredBy: string;
    appName: string;
    pipelineName: string;
    ciMaterials: {
        branch: string;
        commit: string
        commitLink: string;
        type: string;
        webhookData: WebhookData;
    }[];
    buildHistoryLink: string;
}

class WebhookData {
    eventActionType : string;   // merged/non-merged
    data: Map<string, string>;
}

interface ParsedCDEvent {
    eventTime: string;
    triggeredBy: string;
    appName: string;
    pipelineName: string;
    envName: string;
    stage: "Pre-deployment" | "Post-deplloyment" | "Deploy";
    ciMaterials: {
        branch: string;
        commit: string
        commitLink: string;
    }[];
    appDetailsLink: string;
    deploymentHistoryLink: string;
    dockerImg: string;
}
