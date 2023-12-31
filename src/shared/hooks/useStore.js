import { create } from "zustand";

export const useStore = create((set) => ({
  tags: [],
  setTags: (tags) => set({ tags }),
  documentsFound: 0,
  setDocumentsFound: (documentsFound) => set({ documentsFound }),
  pagesCount: 0,
  setPagesCount: (pagesCount) => set({ pagesCount }),
  currentPage: 0,
  setCurrentPage: (currentPage) => set({ currentPage }),
  documents: [],
  setDocuments: (documents) => set({ documents }),
  searchRequestError: null,
  setSearchRequestError: (searchRequestError) => set({ searchRequestError }),
}));
