import {getManager} from "typeorm";
import {SlackConfig} from "../entities/slackConfig";
import {SesConfig} from "../entities/sesConfig";

export class SESConfigRepository {

    findBySESConfigId(id: number) {
        return getManager().getRepository(SesConfig).findOne({where: {id: id}});
    }

    findDefaultSESConfig() {
        return getManager().getRepository(SesConfig).findOne({where: {default: true}});
    }

}