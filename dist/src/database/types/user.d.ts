export interface MigrationsEntity {
    'down': string;
    'id'?: number | null;
    'name': string;
    'up': string;
}
export interface UserEntity {
    'createdAt'?: string | null;
    'deleted'?: boolean | null;
    'deletedAt'?: string | null;
    'email'?: string | null;
    'id'?: number | null;
    'key': string;
    'name'?: string | null;
    'password'?: string | null;
}