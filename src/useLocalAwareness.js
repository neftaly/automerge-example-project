import { useRepo } from "automerge-repo-react-hooks";
import { useEffect } from "react";
import useStateRef from "react-usestateref";

export const useLocalAwareness = (
  userId,
  channelId,
  initialState,
  { heartbeatTime = 15000 } = {}
) => {
  const [localState, setLocalState, localStateRef] = useStateRef(initialState);
  const { ephemeralData, networkSubsystem } = useRepo();
  // TODO: When useRemoteAwareness sees a new peer, send current state

  // Apply updater function to state
  // TODO: Send deltas
  const updateState = (updater) => {
    const state = updater(localStateRef.current);
    setLocalState(state);
    ephemeralData.broadcast(channelId, [userId, state]);
  };

  // Heartbeats
  useEffect(() => {
    const heartbeat = () =>
      void ephemeralData.broadcast(channelId, [userId, localStateRef.current]);
    heartbeat(); // Initial heartbeat
    // TODO: we don't need to send a heartbeat if we've changed state recently; use recursive setTimeout instead of setInterval
    const heartbeatIntervalId = setInterval(heartbeat, heartbeatTime);
    return () => void clearInterval(heartbeatIntervalId);
  }, [ephemeralData]);

  // Send entire state to new peers
  useEffect(() => {
    // TODO: Throttle by ~500ms
    let broadcastTimeoutId;
    const onPeer = networkSubsystem.on("peer", (e) => {
      if (e.channelId !== 'sync_channel') return
      broadcastTimeoutId = setTimeout(
        () =>
          void ephemeralData.broadcast(channelId, [
            userId,
            localStateRef.current,
          ]),
        500 // Wait for the peer to be ready
      );
    });
    return () => {
      onPeer.off();
      broadcastTimeoutId && clearTimeout(broadcastTimeoutId);
    };
  }, [networkSubsystem]);

  return [localState, updateState];
};
