import * as mustache from 'mustache';
import {Event} from "../notification/service/notificationService"
import { NotifierEventLog } from '../entities/notifierEventLogs';
import {NotificationSettings} from "../entities/notificationSettings";

export class EventLogBuilder {

    constructor() {}

    public buildEventLog(event: Event, destination: string, sentStatus: boolean, setting: NotificationSettings) {
        let notifierEventLog = {
            destination: destination,
            source_id: setting.pipeline_id,
            pipeline_type: setting.pipeline_type,
            event_type_id: setting.event_type_id,
            correlation_id: event.correlationId,
            payload: event.payload,
            is_notification_sent: sentStatus,
            event_time: event.eventTime,
            created_at: new Date()
        }
        return notifierEventLog;
    }
}