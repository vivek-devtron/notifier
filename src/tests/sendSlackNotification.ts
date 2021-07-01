const fetch = require('node-fetch');
import Mustache from 'mustache';
import event from './data/cd.json';
import { MustacheHelper } from '../common/mustacheHelper';
import { getMustacheTemplate } from './getMustacheTemplate';
import { Event } from '../notification/service/notificationService';
// Used for sending notification on slack. triggers on /test
export function send() {
    let webhookURL = 'https://hooks.slack.com/services/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';
    let mh = new MustacheHelper();
    
    let parsedEvent = mh.parseEvent(event);
    let mustacheHash = getMustacheTemplate(event as Event);
    let json = Mustache.render(JSON.stringify(mustacheHash), parsedEvent);
    json = JSON.parse(json);
    fetch(webhookURL, { body: json, method: "POST" }).then((r) => {
        return r.text();
    }).then((response) => {
        console.log({ response });
    }).catch((error) => {
        console.error({ error });
    })
}
