import { useRepo } from "automerge-repo-react-hooks";
import { useEffect } from "react";
import useStateRef from "react-usestateref";
import { peerEvents } from "./useRemoteAwareness";

export const useLocalAwareness = (
  userId,
  channelId,
  initialState,
  { heartbeatTime = 15000 } = {}
) => {
  const [localState, setLocalState, localStateRef] = useStateRef(initialState);

  const { ephemeralData, networkSubsystem } = useRepo();
  // TODO: When useRemoteAwareness sees a new peer, send current state

  // TODO: Send deltas
  const setState = (stateOrUpdater) => {
    const state =
      typeof stateOrUpdater === "function"
        ? stateOrUpdater(localStateRef.current)
        : stateOrUpdater;
    setLocalState(state);
    ephemeralData.broadcast(channelId, [userId, state]);
  };

  useEffect(() => {
    const heartbeat = () =>
      void ephemeralData.broadcast(channelId, [userId, localStateRef.current]);
    heartbeat(); // Initial heartbeat
    // TODO: we don't need to send a heartbeat if we've changed state recently; use recursive setTimeout instead of setInterval
    const heartbeatIntervalId = setInterval(heartbeat, heartbeatTime);
    return () => void clearInterval(heartbeatIntervalId);
  }, [ephemeralData]);

  useEffect(() => {
    // Send entire state to new peers
    let broadcastTimeoutId;
    const onPeer = peerEvents.on("new_peer", (e) => {
      if (e.channelId !== channelId) return;
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
  }, [peerEvents]);

  return [localState, setState];
};
