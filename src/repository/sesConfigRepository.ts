import {getManager} from "typeorm";
import {SesConfig} from "../entities/sesConfig";

export class SESConfigRepository {

    findBySESConfigId(id: number) {
        return getManager().getRepository(SesConfig).findOne({where: {id: id}});
    }

    findDefaultSESConfig() {
        return getManager().getRepository(SesConfig).findOne({where: {default: 'true', deleted: false}});
    }

}