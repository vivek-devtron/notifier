import { getManager } from "typeorm";
import {Event} from "../entities/events";

export class EventRepository {

    findById(id: number) {
        return getManager().getRepository(Event).find({ where: { id: id} });
    }

    findByName(name: string) {
        return getManager().getRepository(Event).find({ where: { event_type: name} });
    }

}