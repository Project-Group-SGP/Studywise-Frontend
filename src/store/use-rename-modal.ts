import { create } from "zustand";

const defaultValues = {id:"",title:""};

interface IRenameModal {
  isOpen:boolean;
  initialValues:typeof defaultValues;
  onOpen:(id:string,title:string)=>void;
  onClose:()=>void;
}

interface Boards {
  id: string;
  title: string;
  imageurl: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  groupId: string;
  isFavorite: boolean;
}[];

interface BoardsState {
  initialValue: Boards[];
  setBoards: (boards: Boards[]) => void;
  addBoard: (board: Boards) => void;
  removeBoard: (id: string) => void;
  updatetitle: (id: string, title: string) => void;
}

export const useRenameModal = create<IRenameModal>((set) => ({
  isOpen:false,
  initialValues:defaultValues,
  onOpen:(id,title)=>set({isOpen:true,initialValues:{id:id,title:title}}),
  onClose:()=>set({isOpen:false,initialValues:defaultValues})
}));

export const useBoards = create<BoardsState>((set) => ({
  initialValue: [],
  setBoards: (boards) => set({ initialValue: boards }),
  addBoard: (board) => set((state) => ({ initialValue: [...state.initialValue, board] })),
  removeBoard: (id) => set((state) => ({ initialValue: state.initialValue.filter((board) => board.id !== id) })),
  updatetitle: (id, title) => set((state) => ({ initialValue: state.initialValue.map((board) => (board.id === id ? { ...board, title } : board)) })),
}));