import create from 'zustand';
import { createUISlice, UISlice } from './ui';

export type AppState = UISlice;
export const useBoundStore = create<AppState>((...a) => ({
  ...createUISlice(...a),
}));
