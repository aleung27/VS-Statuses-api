/**
 * Defining the types present in our env file for typescript.
 * Declared under the NodeJS namespace for process.env
 */
declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: string;
    TYPEORM_CONNECTION: string;
    TYPEORM_HOST: string;
    TYPEORM_USERNAME: string;
    TYPEORM_PASSWORD: string;
    TYPEORM_DATABASE: string;
    TYPEORM_PORT: string; // This is actually a number
    TYPEORM_SYNCHRONIZE: string; // This is actually a boolean
    TYPEORM_LOGGING: string; // This is actually a boolean
    TYPEORM_ENTITIES: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
  }
}
