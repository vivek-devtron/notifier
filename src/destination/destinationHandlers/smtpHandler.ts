import NotifmeSdk from 'notifme-sdk'
import {Event, Handler} from '../../notification/service/notificationService';
import Mustache from 'mustache'
import Engine from 'json-rules-engine'
import {EventLogBuilder} from "../../common/eventLogBuilder"
import {EventLogRepository} from '../../repository/notifierEventLogRepository';
import {NotificationSettings} from "../../entities/notificationSettings";
import {NotificationTemplates} from "../../entities/notificationTemplates";
import {UsersRepository} from "../../repository/usersRepository";
import { SMTPConfigRepository } from '../../repository/smtpConfigRepository';

//https://github.com/notifme/notifme-sdk/blob/master/src/models/notification-request.js#L132
export class SMTPService implements Handler {
    eventLogRepository: EventLogRepository
    eventLogBuilder: EventLogBuilder
    smtpConfigRepository: SMTPConfigRepository
    usersRepository: UsersRepository
    logger: any
    smtpConfig: {
      port: string
      host: string
      auth_user: string
      auth_password: string
      from_email: string
    }

    constructor(eventLogRepository: EventLogRepository, eventLogBuilder: EventLogBuilder, smtpConfigRepository: SMTPConfigRepository, usersRepository: UsersRepository, logger: any) {
        this.eventLogRepository = eventLogRepository
        this.eventLogBuilder = eventLogBuilder
        this.smtpConfigRepository = smtpConfigRepository
        this.usersRepository = usersRepository
        this.logger = logger
    }

    handle(event: Event, templates: NotificationTemplates[], setting: NotificationSettings, configsMap: Map<string, boolean>, destinationMap: Map<string, boolean>): boolean {
        let sesTemplate: NotificationTemplates = templates.find(t => {
            return 'ses' == t.channel_type
        })
        if (!sesTemplate) {
            this.logger.info("no smtp template")
            return
        }
        const providerObjects = setting.config
        const providersSet = new Set(providerObjects);
        this.smtpConfig = null
        for (const element of providersSet) {
          if (element['dest'] === "smtp") {
            this.getDefaultConfig(providersSet, event, sesTemplate, setting, destinationMap, configsMap)
            break
          }
        }
        return true
    }

    private async getDefaultConfig(providersSet, event: Event, sesTemplate: NotificationTemplates, setting: NotificationSettings, emailMap: Map<string, boolean>, configsMap: Map<string, boolean> ){
      try {
        const config = await this.smtpConfigRepository.findDefaultSMTPConfig()
        this.smtpConfig = {
          port: config['port'],
          host: config['host'],
          auth_user: config['auth_user'],
          auth_password: config['auth_password'],
          from_email: config['from_email']
        }
        if(this.smtpConfig && this.smtpConfig.from_email){
          providersSet.forEach(p => {
            if (p['dest'] == "smtp") {
                let userId = p['configId']
                let configKey = p['dest'] + '-' + userId
                if (!configsMap.get(configKey)) {
                    this.processNotification(userId, event, sesTemplate, setting, p, emailMap)
                    configsMap.set(configKey, true)
                }
            }
        });
      }
      } catch (error) {
        this.logger.error('getDefaultConfig', error)
        throw new Error('Unable to get default SMTP config');
      }
    }

    private preparePaylodAndSend(event: Event, smtpTemplate: NotificationTemplates, setting: NotificationSettings, p: string){
          let sdk: NotifmeSdk = new NotifmeSdk({
                channels: {
                    email: {
                        providers: [{
                           type: 'smtp',
                           port: this.smtpConfig['port'],
                           host: this.smtpConfig['host'],
                           auth:{
                            user: this.smtpConfig['auth_user'],
                            pass: this.smtpConfig['auth_password'],
                           }
                        }]
                    }
                }
            });
          event.payload['fromEmail'] = this.smtpConfig['from_email']
          let engine = new Engine();
          // let options = { allowUndefinedFacts: true }
          let conditions: string = p['rule']['conditions'];

          if (conditions) {
              engine.addRule({conditions: conditions, event: event});
              engine.run(event).then(e => {
                  this.sendNotification(event, sdk, smtpTemplate.template_payload).then(result => {
                      this.saveNotificationEventSuccessLog(result, event, p, setting);
                  }).catch((error) => {
                      this.logger.error(error.message);
                      this.saveNotificationEventFailureLog(event, p, setting);
                  });
              })
          } else {
              this.sendNotification(event, sdk, smtpTemplate.template_payload).then(result => {
                  this.saveNotificationEventSuccessLog(result, event, p, setting);
              }).catch((error) => {
                  this.logger.error(error.message);
                  this.saveNotificationEventFailureLog(event, p, setting);
              });
          }
    }

    private processNotification(userId: number, event: Event, smtpTemplate: NotificationTemplates, setting: NotificationSettings, p: string, emailMap: Map<string, boolean>) {
        this.usersRepository.findByUserId(userId).then(user => {
            if (!user) {
                this.logger.info('no user found for id')
                this.logger.info(event.correlationId)
                return
            }
            if (!emailMap.get(user['email_id'])) {
                emailMap.set(user['email_id'], true)
                event.payload['toEmail'] = user['email_id']
                this.preparePaylodAndSend(event, smtpTemplate, setting, p)
            } else {
                this.logger.info('duplicate email filtered out')
                return
            }
        })
    }

    public async sendNotification(event: Event, sdk: NotifmeSdk, template: string) {
        try {
            let json = Mustache.render(template, event.payload)
            const res = await sdk.send(
                {
                    email: JSON.parse(json)
                }
            );
            this.logger.info('Notification send')
            this.logger.info(json)
            return res;
        } catch (error) {
          this.logger.error('SMTP sendNotification error', error)
          throw new Error('Unable to send SMTP notification');
        }
    }

    private saveNotificationEventSuccessLog(result: any, event: Event, p: any, setting: NotificationSettings) {
        if (result["status"] == "error") {
            this.saveNotificationEventFailureLog(event, p, setting)
        } else {
            let eventLog = this.eventLogBuilder.buildEventLog(event, p.dest, true, setting);
            this.eventLogRepository.saveEventLog(eventLog);
        }
    }

    private saveNotificationEventFailureLog(event: Event, p: any, setting: NotificationSettings) {
        let eventLog = this.eventLogBuilder.buildEventLog(event, p.dest, false, setting);
        this.eventLogRepository.saveEventLog(eventLog);
    }
}