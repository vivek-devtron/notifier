import {getManager} from "typeorm";
import {Users} from '../entities/users';

export class UsersRepository {

    findByUserId(id: number) {
        return getManager().getRepository(Users).findOne({where: {id: id}});
    }

}