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
  const { ephemeralData } = useRepo();
  const setLocalAwarenessState = (state) => {
    setLocalState(state);
    ephemeralData.broadcast(channelId, [userId, state]);
  };
  useEffect(() => {
    const heartbeat = () => {
      ephemeralData.broadcast(channelId, [userId, localStateRef.current]);
    };
    heartbeat(); // Initial heartbeat
    // TODO: we don't need to send a heartbeat if we've changed state recently; use recursive setTimeout instead of setInterval
    const heartbeatIntervalId = setInterval(heartbeat, heartbeatTime);
    return () => clearInterval(heartbeatIntervalId);
  }, [ephemeralData]);
  return [localState, setLocalAwarenessState];
};
