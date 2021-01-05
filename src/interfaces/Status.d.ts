/**
 * Interface representing each user's current status as returned from
 * POST update. Contains the needed information on each user to render the
 * view on the extension end.
 */
export default interface Status {
  username: string;
  displayName: string | null;
  profilePicUrl: string;
  timestamp: number;
  language: string | null;
  filename: string | null;
  workspaceName: string | null;
  customMessage: string | null;
}
