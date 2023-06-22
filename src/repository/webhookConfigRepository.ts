import { getManager } from "typeorm";
import { WebhookConfig } from "../entities/webhookconfig";

export class WebhookConfigRepository {

    findByWebhookConfigId(webhookConfigId: number) {
        return getManager().getRepository(WebhookConfig).findOne({ where: { id: webhookConfigId} });
    }

}