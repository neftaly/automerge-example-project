import { useDocument } from "automerge-repo-react-hooks";
import { applyChanges, applyChange } from "./util";
import { useState } from "react";

export function App({ documentId }) {
  const [doc, changeDoc] = useDocument(documentId);

  // TODO: We actually want an awareness state object,
  // which holds both our changes (and maybe those of others),
  // and a way to commit our changes to the document.
  // Can we just use immer+zustand for this? Will it support Automerge.text changes etc?
  const [newCount, setNewCount] = useState(null);

  const count = doc?.count ?? 0;
  return (
    <div>
      <input
        type="number"
        value={newCount ?? count}
        placeholder={count}
        style={{ color: newCount ? "red" : "black" }}
        onChange={(e) => {
          setNewCount(e.target.value);
        }}
      />
      <span children={count} style={{display:'inline-block',backgroundColor:'silver'}}/>
      <button
        onClick={() => {
          applyChanges(changeDoc, [[["count"], ()=>newCount]]);
          setNewCount(null);
        }}
        children="save applyChanges"
      />
      <button
        onClick={() => changeDoc(doc => {
          applyChange(doc, ["count"], ()=>newCount);
          setNewCount(null);
        })}
        children="save applyChange"
      />
      <button children="reset" onClick={() => setNewCount(null)} />
      {/* <button children="undo" onClick={() => changeDoc.undo()} /> */}
      {/* <button children="redo" onClick={() => changeDoc.redo()} /> */}
    </div>
  );
}
