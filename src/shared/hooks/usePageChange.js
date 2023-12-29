import { useSearchParams } from "react-router-dom";
import { useStore } from "./useStore";

export const usePageChange = () => {
  const { setCurrentPage } = useStore();
  const [_, setSearchParams] = useSearchParams();
  const currentPageQueryParamName = "pageNumber";

  return (value) => {
    setCurrentPage(value);
    setSearchParams((prev) => {
      prev.set(currentPageQueryParamName, value);
      return prev;
    });
  };
};
