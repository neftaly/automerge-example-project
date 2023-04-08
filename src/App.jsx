import { useDocument } from "automerge-repo-react-hooks";
import { applyChange } from "./util";
import { useLocalAwareness } from "./useLocalAwareness";
import { useRemoteAwareness } from "./useRemoteAwareness";

export function App({ documentId, userId }) {
  const [doc, changeDoc] = useDocument(documentId);

  const channelId = `${documentId}-useAwareness`;
  const [localState, updateLocalState] = useLocalAwareness(
    userId,
    channelId,
    {}
  );
  const [peerStates, heartbeats] = useRemoteAwareness(channelId, {
    localUserId: userId,
  });

  const newCount = localState?.count;
  const count = doc?.count ?? 0;

  return (
    <div>
      <input
        type="number"
        value={newCount ?? count}
        placeholder={count}
        style={{ color: newCount ? "red" : "black" }}
        onChange={(e) =>
          updateLocalState((state) => ({
            ...state,
            count: e.target.value,
          }))
        }
      />
      <div>
        Doc state:
        <span
          children={count}
          style={{ display: "inline-block", backgroundColor: "silver" }}
        />
      </div>
      <div>
        Peer states:
        {Object.entries(peerStates).map(([peerId, { count } = {}]) => (
          <span
            key={peerId}
            style={{ backgroundColor: "silver", marginRight: "2px" }}
          >
            {peerId}: {count ?? "🤷‍♀️"}
          </span>
        ))}
      </div>
      <br />
      <button
        onClick={() =>
          changeDoc((doc) => {
            if (newCount === undefined) return;
            applyChange(doc, ["count"], () => newCount);
            updateLocalState((state) => ({ ...state, count: undefined }));
          })
        }
        disabled={newCount === undefined}
        children="commit"
      />
      <button
        onClick={() =>
          updateLocalState((state) => ({ ...state, count: undefined }))
        }
        disabled={newCount === undefined}
        children="reset"
      />
      {/* <button children="undo" onClick={() => changeDoc.undo()} /> */}
      {/* <button children="redo" onClick={() => changeDoc.redo()} /> */}
      <pre>
        {JSON.stringify({ localState, peerStates, heartbeats }, null, 2)}
      </pre>
    </div>
  );
}
