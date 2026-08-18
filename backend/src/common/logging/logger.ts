import { Client } from "@elastic/elasticsearch";
import { env } from "@/config/env";

type LogLevel = "info" | "warn" | "error";

export interface LogContext {
  [key: string]: unknown;
}

let elasticClient: Client | undefined;

export async function initializeLogger(): Promise<void> {
  if (!env.ELASTICSEARCH_ENABLED) {
    console.info("Elasticsearch logging is disabled");
    return;
  }

  elasticClient = new Client({
    node: env.ELASTICSEARCH_NODE,
    ...(env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD
      ? { auth: { username: env.ELASTICSEARCH_USERNAME, password: env.ELASTICSEARCH_PASSWORD } }
      : {}),
  });

  try {
    await elasticClient.ping();
    await elasticClient.indices.putIndexTemplate({
      name: "cinema-api-logs-template",
      index_patterns: ["cinema-api-logs-*"],
      template: {
        mappings: {
          properties: {
            "@timestamp": { type: "date" },
            level: { type: "keyword" },
            event: { type: "keyword" },
            method: { type: "keyword" },
            path: { type: "keyword" },
            statusCode: { type: "integer" },
            durationMs: { type: "long" },
            requestId: { type: "keyword" },
          },
        },
      },
    });
    console.info("Elasticsearch logging connected");
  } catch (error) {
    // Logging must never prevent the cinema API from starting.
    elasticClient = undefined;
    console.error("Elasticsearch logging unavailable; continuing without it", error);
  }
}

export function log(level: LogLevel, event: string, context: LogContext = {}): void {
  const document = { "@timestamp": new Date().toISOString(), level, event, ...context };
  const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  consoleMethod(JSON.stringify(document));

  if (!elasticClient) return;
  void elasticClient
    .index({ index: `cinema-api-logs-${new Date().toISOString().slice(0, 10)}`, document })
    .catch((error) => console.error("Unable to write log to Elasticsearch", error));
}

export async function closeLogger(): Promise<void> {
  await elasticClient?.close();
}

export interface LogSearchFilter {
  page?: number;
  limit?: number;
  level?: string;
  search?: string;
}

export interface LogSearchResult {
  data: LogContext[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  enabled: boolean;
}

export async function searchLogs(
  filter: LogSearchFilter
): Promise<LogSearchResult> {
  const page = Math.max(filter.page ?? 1, 1);
  const limit = Math.min(Math.max(filter.limit ?? 20, 1), 100);

  if (!elasticClient) {
    return { data: [], total: 0, page, limit, totalPages: 0, enabled: false };
  }

  const must: Record<string, unknown>[] = [];
  if (filter.level) {
    must.push({ term: { level: filter.level } });
  }
  if (filter.search) {
    must.push({
      multi_match: {
        query: filter.search,
        fields: ["event", "message", "method", "path", "stack", "userId", "requestId"],
      },
    });
  }

  const res = await elasticClient.search({
    index: "cinema-api-logs-*",
    size: limit,
    from: (page - 1) * limit,
    sort: [{ "@timestamp": { order: "desc" } }],
    query: must.length ? { bool: { must } } : { match_all: {} },
  });

  const hits = res.hits?.hits ?? [];
  const rawTotal = res.hits?.total;
  const total =
    typeof rawTotal === "number"
      ? rawTotal
      : typeof rawTotal === "object" && rawTotal
        ? rawTotal.value
        : 0;

  const data = hits.map((hit) => ({
    id: hit._id,
    ...(hit._source as object),
  }));

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    enabled: true,
  };
}
