import { useSearchParams } from "react-router-dom";
import { useStore } from "./useStore";

export const useSearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPageQueryParamName = "pageNumber";

  const {
    setDocuments,
    setPagesCount,
    setDocumentsFound,
    setTags,
    setCurrentPage,
    setSearchRequestError,
  } = useStore();

  const handlePageChange = (value) => {
    setCurrentPage(value);
    setSearchParams((prev) => {
      prev.set(currentPageQueryParamName, value);
      return prev;
    });
  };

  const fetchSearchResults = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/search?${searchParams.toString()}`,
      {
        method: "GET",
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((searchResponse) => {
        console.log("Поисковый запрос: ", searchParams.get("query"));
        setDocumentsFound(searchResponse.documentsFound);
        setTags(
          searchResponse.tags?.sort(
            (a, b) =>
              b.documentCount - a.documentCount || a.name.localeCompare(b.name)
          )
        );
        setDocuments(searchResponse.documents);
        setPagesCount(searchResponse.pages);
        setSearchRequestError(null);
        if (searchResponse.requestPageIsOutOfBounds)
          handlePageChange(searchResponse.pages);
      })
      .catch((e) => {
        e.json().then((jsonError) => setSearchRequestError(jsonError));
      });
  };

  return fetchSearchResults;
};
