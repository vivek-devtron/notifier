import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";
 
@Entity("notifier_event_log")
export class NotifierEventLog {
 
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    destination: string;
 
    @Column()
    source_id: number;
    
    @Column()
    pipeline_type: string;

    @Column()
    event_type_id: number;

    @Column()
    correlation_id: string;

    @Column()
    payload: string;

    @Column()
    is_notification_sent: boolean;

    @Column({ type: 'timestamptz' })
    event_time: Date;

    @Column({ type: 'timestamptz' })
    created_at: Date;

}