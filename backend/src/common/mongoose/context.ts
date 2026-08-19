import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  userId?: string;
  userRole?: string;
}

/**
 * Request-scoped storage used by the audit plugin to auto-populate
 * getContext == ICurrentUser in .NET
 */
export const requestContext = new AsyncLocalStorage<RequestContext>();

export const runWithContext = <T>(
  context: RequestContext,
  fn: () => T
): T => requestContext.run(context, fn);

export const getContext = (): RequestContext => requestContext.getStore() ?? {};

export const setCurrentUser = (user: { sub: string; role: string }): void => {
  const store = requestContext.getStore();
  if (store) {
    store.userId = user.sub;
    store.userRole = user.role;
  }
};