import { getManager } from "typeorm";
import {SlackConfig} from "../entities/slackConfig";

export class SlackConfigRepository {

    findBySlackConfigId(slackConfigId: number) {
        return getManager().getRepository(SlackConfig).findOne({ where: { id: slackConfigId} });
    }

}