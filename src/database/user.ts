import { SQLDataSource } from "datasource-sql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pino from "pino";
import { SECRET } from "../../consts";
import { runAppMigrations } from "../main";
import { UserEntity } from "./types/user";
const log = pino({
  transport: {
    target: "pino-pretty",
  },
});

class UserDatabase extends SQLDataSource {
  async getUserByEmail({ email }: { email: string }) {
    log.debug(`Getting user by email`);
    try {
      const user = await this.knex("user").where({ email }).first();
      return user;
    } catch (err) {
      log.error(`Failed to get user with email - ${err}`);
      throw err;
    }
  }

  async getUser(key: string): Promise<UserEntity> {
    log.debug(`Getting user with key: ${key}`);
    try {
      const user = await this.knex("user").where({ key }).first();
      return user;
    } catch (err) {
      log.error(`Failed to get user with key: ${key} - ${err}`);
      throw err;
    }
  }

  async createUser(key: string, email: string, password: string, name: string) {
    log.debug("Creating user");
    try {
      const insertedId = await this.knex("user").insert({
        key,
        email,
        password: await bcrypt.hash(password, 12),
        name,
        createdAt: new Date(),
        deleted: false,
      });
      if (insertedId) {
        /* Create an app database and migrate */
        await runAppMigrations(`./databases/${key}.db`);

        return await this.getUser(key);
      }
      log.error(`Failed to create user`);
      throw new Error("Failed to create user");
    } catch (e) {
      log.error(`Failed to create user - ${e}`);
      throw e;
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await this.getUserByEmail({ email });
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error("Incorrect password");
      }
      const token = await jwt.sign(
        {
          user: { key: user.key, email: user.email },
        },
        SECRET,
        { expiresIn: "5y" }
      );
      return { email: user.email, key: user.key, token };
    } catch (e) {
      log.error("Failed to login user - no user with that email");
      throw e;
    }
  }

  async deleteUser(key: string) {
    console.log(key);
    console.log("To be implemented");
    return "";
  }
}

export default UserDatabase;
