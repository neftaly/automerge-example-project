import { useDocument } from "automerge-repo-react-hooks";
import { applyChange } from "./util";
import { useLocalAwareness, usePeerAwareness } from "./awareness";

export function App({ documentId }) {
  const [doc, changeDoc] = useDocument(documentId);

  const channelId = `${documentId}-useAwareness`;
  const [localState, setLocalState] = useLocalAwareness(channelId, {});
  const [peerStates, heartbeats] = usePeerAwareness(channelId);

  const newCount = localState?.count;
  const count = doc?.count ?? 0;

  return (
    <div>
      <input
        type="number"
        value={newCount ?? count}
        placeholder={count}
        style={{ color: newCount ? "red" : "black" }}
        onChange={(e) => {
          setLocalState({
            count: e.target.value,
          });
        }}
      />
      <span
        children={count}
        style={{ display: "inline-block", backgroundColor: "silver" }}
      />
      <button
        onClick={() =>
          changeDoc((doc) => {
            if (newCount === undefined) return;
            applyChange(doc, ["count"], () => newCount);
            setLocalState({});
          })
        }
        children="commit"
      />
      <button children="reset" onClick={() => setLocalState({})} />
      {/* <button children="undo" onClick={() => changeDoc.undo()} /> */}
      {/* <button children="redo" onClick={() => changeDoc.redo()} /> */}
      <pre>
        {JSON.stringify({ localState, peerStates, heartbeats }, null, 2)}
      </pre>
    </div>
  );
}
