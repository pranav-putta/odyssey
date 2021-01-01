import { combineReducers } from '@reduxjs/toolkit';
import auth from './auth/auth.slice';
import ui from './ui/ui.slice';
import feed from './feed/feed.slice';

const appReducer = combineReducers({
  auth,
  ui,
  feed,
});

export type AppState = ReturnType<typeof appReducer>;
export default appReducer;
