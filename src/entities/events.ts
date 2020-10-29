import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";
 
@Entity("event")
export class Event {
 
    @PrimaryGeneratedColumn()
    id: number;
 
    @Column()
    event_type: string;

    @Column()
    description: string;

}