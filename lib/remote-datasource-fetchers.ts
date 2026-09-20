import type { RemoteDatasourceFetcher } from "@pantheon-systems/puck-css/server";
import { CONTENT_PUBLISHER_FETCHERS } from "./content-publisher";
import { GLU_COLLECTION_FETCHERS } from "./glu-datasources";
import { PROGRAMS_FETCHER } from "./glu-programs";

export const REMOTE_DATASOURCE_FETCHERS: RemoteDatasourceFetcher[] = [
  ...GLU_COLLECTION_FETCHERS,
  PROGRAMS_FETCHER,
  ...CONTENT_PUBLISHER_FETCHERS,
];
