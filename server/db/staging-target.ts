import "server-only";

export const HOSTINGER_STAGING_DATABASE = "u874339379_findmyduptest";
export const PRODUCTION_DATABASE = "u874339379_findmydupde";

export function isStagingDatabase(database: string) {
  if (database.toLowerCase() === PRODUCTION_DATABASE) return false;
  return database === HOSTINGER_STAGING_DATABASE ||
    /(?:^|_)staging(?:_|$)|^findmydup_test$/.test(database);
}
