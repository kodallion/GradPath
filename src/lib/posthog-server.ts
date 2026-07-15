import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

export function getPostHogServerClient() {
  const projectApiKey = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!projectApiKey || !host) {
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(projectApiKey, {
      host,
      flushAt: 1,
      flushInterval: 0,
      enableExceptionAutocapture: true,
    });
  }

  return posthogClient;
}

export async function captureServerEvent({
  distinctId,
  event,
  properties,
}: {
  distinctId: string;
  event: string;
  properties?: Record<string, unknown>;
}) {
  const client = getPostHogServerClient();
  if (!client) return;

  client.capture({
    distinctId,
    event,
    properties,
  });

  await client.flush();
}

export async function identifyServerUser({
  distinctId,
  properties,
}: {
  distinctId: string;
  properties?: Record<string, unknown>;
}) {
  const client = getPostHogServerClient();
  if (!client) return;

  client.identify({
    distinctId,
    properties,
  });

  await client.flush();
}
