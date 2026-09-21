import type { RemoteDatasourceFetcher } from "@pantheon-systems/puck-css/server";
import { CONTENT_PUBLISHER_FETCHERS } from "./content-publisher";
import { GLU_COLLECTION_FETCHERS } from "./glu-datasources";

export const REMOTE_DATASOURCE_FETCHERS: RemoteDatasourceFetcher[] = [
  ...GLU_COLLECTION_FETCHERS,
  ...CONTENT_PUBLISHER_FETCHERS,
];
