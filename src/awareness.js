import { useRepo } from "automerge-repo-react-hooks";
import { useEffect } from "react";
import useStateRef from "react-usestateref";

// Local awareness state
export const useLocalAwareness = (
  channelId,
  initialState,
  { heartbeatTime = 1500 } = {}
) => {
  const [localState, setLocalState, localStateRef] = useStateRef(initialState);
  const { ephemeralData } = useRepo();
  const setLocalAwarenessState = (state) => {
    // console.log("setLocalAwarenessState", state);
    setLocalState(state);
    ephemeralData.broadcast(channelId, state);
  };
  useEffect(() => {
    // console.log('local useeffect')
    const heartbeat = () => {
      // console.log("heartbeat", localStateRef.current);
      ephemeralData.broadcast(channelId, localStateRef.current);
    };
    heartbeat(); // Initial heartbeat
    // TODO: we don't need to send a heartbeat if we've changed state recently; use recursive setTimeout instead of setInterval
    const heartbeatIntervalId = setInterval(heartbeat, heartbeatTime);
    return () => clearInterval(heartbeatIntervalId);
  }, [ephemeralData]);
  return [localState, setLocalAwarenessState];
};

// Remote awareness state
export const usePeerAwareness = (
  channelId,
  { offlineTimeout = 3000, getTime = () => new Date().getTime() } = {}
) => {
  const [peerStates, setPeerStates, peerStatesRef] = useStateRef({});
  const [heartbeats, setHeartbeats, heartbeatsRef] = useStateRef({});
  const { ephemeralData } = useRepo();
  useEffect(() => {
    // console.log('peer useeffect')
    const handleIncomingUpdate = (event) => {
      if (event.channelId === channelId) {
        const heartbeats = heartbeatsRef.current;
        const peerStates = peerStatesRef.current;
        // console.log("handleIncomingUpdate", event);
        setHeartbeats({
          ...heartbeats,
          [event.peerId]: getTime(),
        });
        setPeerStates({
          ...peerStates,
          [event.peerId]: event.data,
        });
      }
    };
    const pruneOfflinePeers = () => {
      const heartbeats = heartbeatsRef.current;
      const peerStates = peerStatesRef.current;
      const time = getTime();
      for (const key in heartbeats) {
        if (time - heartbeats[key] > offlineTimeout) {
          delete heartbeats[key];
          delete peerStates[key];
        }
      }
      setHeartbeats(heartbeats);
      setPeerStates(peerStates);
    };
    ephemeralData.on("data", handleIncomingUpdate);
    const pruneOfflinePeersIntervalId = setInterval(
      pruneOfflinePeers,
      offlineTimeout
    );
    return () => {
      ephemeralData.removeListener("data", handleIncomingUpdate);
      clearInterval(pruneOfflinePeersIntervalId);
    };
  }, [ephemeralData]);
  return [peerStates, heartbeats];
};
