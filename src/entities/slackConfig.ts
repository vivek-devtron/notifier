import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity("slack_config")
export class SlackConfig {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    web_hook_url: string;

    @Column()
    config_name: string;

    @Column()
    description: string;

}