import { trace } from "@opentelemetry/api";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { configureOpentelemetry } from "@uptrace/node";
import { env } from "~/env.mjs";

function initializeTracing(serviceName: string) {
  configureOpentelemetry({
    // Set dsn or UPTRACE_DSN env var.
    dsn: env.UPTRACE_DSN,
    serviceName: serviceName,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    instrumentations: [new HttpInstrumentation(), new PrismaInstrumentation()],
  });

  return trace.getTracer(serviceName);
}

export const tracer = initializeTracing("authorie");
