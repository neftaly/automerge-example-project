import { useDocument } from "automerge-repo-react-hooks";
import { applyChange } from "./util";
import { useAwareness } from "./useAwareness";

export function App({ documentId }) {
  const [doc, changeDoc] = useDocument(documentId);

  const states = useAwareness((s) => s.states);
  const updateState = useAwareness((s) => s.updateState);
  const newCount = useAwareness((s) => s.states[s.clientId].count);

  const count = doc?.count ?? 0;
  return (
    <div>
      <input
        type="number"
        value={newCount ?? count}
        placeholder={count}
        style={{ color: newCount ? "red" : "black" }}
        onChange={(e) => {
          updateState((s) => ({
            count: e.target.value,
          }));
        }}
      />
      <span
        children={count}
        style={{ display: "inline-block", backgroundColor: "silver" }}
      />
      <button
        onClick={() =>
          changeDoc((doc) => {
            if (newCount === undefined) return
              applyChange(doc, ["count"], () => newCount);
              updateState((s) => ({ count: undefined }));
          })
        }
        children="commit"
      />
      <button
        children="reset"
        onClick={() =>
          updateState((s) => ({ count: undefined }))
        }
      />
      {/* <button children="undo" onClick={() => changeDoc.undo()} /> */}
      {/* <button children="redo" onClick={() => changeDoc.redo()} /> */}
      <pre>{JSON.stringify(states, null, 2)}</pre>
    </div>
  );
}
