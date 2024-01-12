import {getManager} from "typeorm";
import {SMTPConfig} from "../entities/smtpConfig";

export class SMTPConfigRepository {

    findBySMTPConfigId(id: number) {
        return getManager().getRepository(SMTPConfig).findOne({where: {id: id}});
    }

    findDefaultSMTPConfig() {
        return getManager().getRepository(SMTPConfig).findOne({where: {default: 'true', deleted: false}});
    }

}