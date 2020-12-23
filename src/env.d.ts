/**
 * Defining the types present in our env file for typescript.
 * Declared under the NodeJS namespace for process.env
 */
declare namespace NodeJS {
  export interface ProcessEnv {
    GITHUB_CLIENT_SECRET: string;
    GITHUB_CLIENT_ID: string;
    URL: string;
  }
}
