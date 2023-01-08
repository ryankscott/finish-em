import { SQLDataSource } from "datasource-sql";
import { UserEntity } from "./types/user";
declare class UserDatabase extends SQLDataSource {
    getUserByEmail({ email }: {
        email: string;
    }): Promise<any>;
    getUser(key: string): Promise<UserEntity>;
    createUser(key: string, email: string, password: string, name: string): Promise<UserEntity>;
    loginUser(email: string, password: string): Promise<{
        email: any;
        key: any;
        token: any;
    }>;
    deleteUser(key: string): Promise<string>;
}
export default UserDatabase;
