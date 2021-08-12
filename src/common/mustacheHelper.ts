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
                    let _webhookDataInRequest = trigger.WebhookData;
                    let _isMergedTypeWebhook = _webhookDataInRequest.EventActionType == 'merged';
                    if (_isMergedTypeWebhook){
                        _webhookDataInRequest.Data = this.modifyWebhookDataForMergedType(_webhookDataInRequest.Data, ci.url)
                    }
                    let _webhookData : WebhookData = {
                        mergedType : _isMergedTypeWebhook,
                        data: _webhookDataInRequest.Data
                    }
                    _material = {
                        webhookType : true,
                        webhookData: _webhookData
                    }
                }else{
                    _material = {
                        branch: ci.value || "NA",
                        commit: trigger.Commit ? trigger.Commit.substring(0, 8) : "NA",
                        commitLink: this.createGitCommitUrl(ci.url, trigger.Commit),
                        webhookType : false,
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

    modifyWebhookDataForMergedType (webhookDataMap: any, gitUrl : string) : any {
        // set target checkout link
        let _targetCheckout = webhookDataMap["target checkout"];
        if (_targetCheckout){
            webhookDataMap["target checkout link"] = this.createGitCommitUrl(gitUrl, _targetCheckout)
            webhookDataMap["target checkout"] = _targetCheckout.substring(0, 8);
        }else{
            webhookDataMap["target checkout"] = "NA";
        }

        // set source checkout link
        let _sourceCheckout = webhookDataMap["source checkout"];
        if (_sourceCheckout){
            webhookDataMap["source checkout link"] = this.createGitCommitUrl(gitUrl, _sourceCheckout)
            webhookDataMap["source checkout"] = _sourceCheckout.substring(0, 8);
        }else{
            webhookDataMap["source checkout"] = "NA";
        }

        return webhookDataMap
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
        isWebhookType: boolean;
        webhookData: WebhookData;
    }[];
    buildHistoryLink: string;
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
        webhookType: boolean;
        webhookData: WebhookData;
    }[];
    appDetailsLink: string;
    deploymentHistoryLink: string;
    dockerImg: string;
}

class WebhookData {
    mergedType : boolean;   // merged/non-merged
    data: Map<string, string>;
}