/**
 * Interface for what the request body should look like when posting an update
 * to our API
 */
export default interface ActivityInterface {
  timestamp: number;
  language: string | null;
  filename: string | null;
  workspaceName: string | null;
  customMessage: string | null;
}
