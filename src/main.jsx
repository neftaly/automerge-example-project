import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import { Repo } from "automerge-repo"
import { BroadcastChannelNetworkAdapter } from "automerge-repo-network-broadcastchannel"
import { RepoContext } from "automerge-repo-react-hooks"

const repo = new Repo({
  network: [
    new BroadcastChannelNetworkAdapter()
  ]
})

const rootDocId = (() => {
  if (localStorage.rootDocId) return localStorage.rootDocId
  const handle = repo.create()
  localStorage.rootDocId = handle.documentId
  return handle.documentId
})()

ReactDOM.createRoot(document.getElementById("root")).render(
  <RepoContext.Provider value={repo}>
    <React.StrictMode>
      <App documentId={rootDocId} />
    </React.StrictMode>
  </RepoContext.Provider>
)