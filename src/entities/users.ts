import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity("users")
export class Users {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email_id: string;
}