import { Database } from "sqlite3";

const db = new Database("test.db");

const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
console.log(version);

db.close();

export function proxyFetch(url: URL, req: RequestInit = {}): Promise<Response> {
  return fetch(url, req);
}
