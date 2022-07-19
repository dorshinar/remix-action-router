import type { ActionsStore } from ".";

declare global {
  // eslint-disable-next-line no-var
  var actionsStore: ActionsStore;
}
