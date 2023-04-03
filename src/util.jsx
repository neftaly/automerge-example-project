// Apply a change to the document
export const applyChange = (doc, path, updater) => {
  let parent = doc;
  for (const key of path.slice(0, -1)) parent = parent[key];
  const childKey = path[path.length - 1];
  parent[childKey] = updater(parent[childKey]);
};
