import { ChannelId } from "automerge-repo";
import { useRepo } from "automerge-repo-react-hooks";
import { useEffect, useRef, useCallback } from "react";

export function useMessaging<M>(
  channelId: ChannelId,
  onMessage: (message: M) => void | undefined
): (msg: M) => void {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const { ephemeralData } = useRepo();

  useEffect(() => {
    const handler = (event) => {
      if (event.channelId == channelId && onMessageRef.current) {
        onMessageRef.current(event.data as M);
      }
    };
    ephemeralData.on("data", handler);
    return () => {
      ephemeralData.off("data", handler);
    };
  }, [channelId]);

  const sendMessage = useCallback(
    (message: M) => {
      ephemeralData.broadcast(channelId, message);
    },
    [channelId]
  );

  return sendMessage;
}
