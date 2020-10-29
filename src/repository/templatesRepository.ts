import {getManager} from "typeorm";
import {NotificationTemplates} from "../entities/notificationTemplates";

export class NotificationTemplatesRepository {

    findByEventTypeIdAndNodeType(eventTypeId: number, nodeType: string) {
        return getManager().getRepository(NotificationTemplates).find({
            where: {
                event_type_id: eventTypeId,
                node_type: nodeType
            }
        });
    }
}