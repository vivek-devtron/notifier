import { NotifierEventLog } from "../entities/notifierEventLogs";
import { getManager } from "typeorm";

export class EventLogRepository {

    saveEventLog(eventLog) {
        return getManager().getRepository(NotifierEventLog).save(eventLog);
    }

}
