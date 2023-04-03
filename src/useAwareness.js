import { create } from "zustand";

const HEARTBEAT_INTERVAL = 20000; // How often to send a heartbeat
const OFFLINE_INTERVAL = 30000; // How long before clients are marked as offline

const getTime = () => new Date().getTime();

// Send a heartbeat every x seconds
setInterval(() => useAwareness.getState().heartbeat(), HEARTBEAT_INTERVAL);

// Prune offline clients every x seconds
setInterval(() => useAwareness.getState().prune(), OFFLINE_INTERVAL);

// we want to send deltas to other clients for every update,
// then every X seconds send a full copy of the data
// https://docs.yjs.dev/api/about-awareness
export const useAwareness = create((set, get) => ({
  clientId: 0,
  states: {
    0: {
      count: undefined,
    },
  },
  heartbeats: {
    0: getTime(),
  },

  // Apply an update to a client's state
  // TODO: Use immer
  updateStates: (clientId, updater) =>
    set(({ states, heartbeats }) => {
      states[clientId] = updater(states[clientId]);
      heartbeats[clientId] = getTime();
      return { states, heartbeats };
    }),

  // Update local state
  updateState: (updater) => {
    const { updateStates, clientId } = get();
    return updateStates(clientId, updater);
  },

  // Send a heartbeat to other clients
  heartbeat: () => get().updateState((state) => state),

  // Prune offline clients
  // TODO: Use immer
  prune: () =>
    set(({ states, heartbeats }) => {
      const time = getTime();
      for (const key in heartbeats) {
        if (time - heartbeats[key] > OFFLINE_INTERVAL) {
          delete states[key];
          delete heartbeats[key];
        }
      }
      return { states, heartbeats };
    }),
}));
