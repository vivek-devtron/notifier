import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity("notification_settings")
export class NotificationSettings {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    team_id: number;

    @Column()
    app_id: number;

    @Column()
    env_id: number;

    @Column()
    pipeline_id: number;

    @Column()
    pipeline_type: string;

    @Column()
    event_type_id: number;

    @Column('json')
    config: string

    @Column()
    view_id: number;

}