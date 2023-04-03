import { create } from "zustand";

// we want to send deltas to other clients for every update,
// then every X seconds send a full copy of the data

// https://docs.yjs.dev/api/about-awareness
const awareness = ({
  clientId,
  heartbeatTime = 20000,
  pruneOfflineTime = 30000,
  getTime = () => new Date().getTime(),
}) => {
  // Send a heartbeat every x seconds
  const heartbeatInterval = setInterval(
    () => useAwareness.getState().heartbeat(),
    heartbeatTime
  );

  // Prune offline clients every x seconds
  const pruneOfflineInterval = setInterval(
    () => useAwareness.getState().pruneOffline(),
    pruneOfflineTime
  );

  const useAwareness = create((set, get) => ({
    clientId,
    states: { [clientId]: {} },
    heartbeats: { [clientId]: getTime() },

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
    pruneOffline: () =>
      set(({ states, heartbeats }) => {
        const time = getTime();
        for (const key in heartbeats) {
          if (time - heartbeats[key] > pruneOfflineTime) {
            delete states[key];
            delete heartbeats[key];
          }
        }
        return { states, heartbeats };
      }),

    close: () => {
      clearInterval(heartbeatInterval);
      clearInterval(pruneOfflineInterval);
    },
  }));

  const { close } = useAwareness.getState();
  
  return {
    useAwareness,
    close,
  };
};

export default awareness;
