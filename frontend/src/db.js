import Dexie from "dexie";

// Local storage on the device. A seizure is saved here first, then sent
// to the server when the connection is available.
export const db = new Dexie("SeizureTrackerDB");

// synced: 0 = not yet sent to the server, 1 = saved on the server.
// clientId is created on the device, so a retry cannot create a duplicate.
db.version(1).stores({
  pendingSeizures: "clientId, startedAt, synced",
});

export default db;