export const applyChange = (doc, path, updater) => {
  let parent = doc;
  for (const key of path.slice(0, -1)) parent = parent[key];
  const childKey = path[path.length - 1];
  parent[childKey] = updater(parent[childKey]);
};

// Apply an array of changes to the document
// [[path, updater], ...]
export const applyChanges = (changeDoc, changes) =>
  changeDoc((doc) => changes.forEach((change) => applyChange(doc, ...change)));
