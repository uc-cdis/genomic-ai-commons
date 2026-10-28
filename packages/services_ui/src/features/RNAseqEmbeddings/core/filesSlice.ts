import { createEntityAdapter } from '@reduxjs/toolkit';
import type {DataFileBundle} from "./types";

// const usersAdapter = createEntityAdapter<DataFileBundle>({
//     // Optional: sort by name
//     sortComparer: (a, b) => a.name.localeCompare(b.name),
// });
//
// // Get the pre-configured initial state structure: { ids: [], entities: {} }
// const initialState = usersAdapter.getInitialState();
