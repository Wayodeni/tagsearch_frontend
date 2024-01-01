import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageChange, useSearchResults, useStore } from "../../shared/hooks";
import { Document, Tag } from "./ui";

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPageQueryParamName = "pageNumber";
  const querystringQueryParamName = "query";
  const {
    tags,
    documents,
    currentPage,
    setCurrentPage,
    pagesCount,
    documentsFound,
    searchRequestError,
  } = useStore();
  const fetchSearchResults = useSearchResults();

  useEffect(() => {
    setCurrentPage(+searchParams.get(currentPageQueryParamName));
  }, []);

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams]);

  const handleQuerystringChange = (queryString) => {
    setSearchParams((prev) => {
      prev.set(querystringQueryParamName, queryString);
      return prev;
    });
  };

  const handlePageChange = usePageChange();

  return (
    <>
      <TextField
        id="outlined-basic"
        label={
          searchRequestError
            ? `Ошибка при выполнении поискового запроса: ${searchRequestError}`
            : "Поисковый запрос"
        }
        error={searchRequestError ? true : undefined}
        defaultValue={searchParams.get("query")}
        variant="outlined"
        onChange={(e) => handleQuerystringChange(e.target.value)}
        sx={{ width: "100%" }}
      />
      <Typography>
        Найдено документов: {documentsFound} Тегов: {tags?.length}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        <Pagination
          count={pagesCount}
          page={currentPage > 0 ? currentPage : 1}
          onChange={(e, value) => handlePageChange(value)}
          color="primary"
          variant="outlined"
          shape="rounded"
          sx={{
            mb: 2,
          }}
          showFirstButton
          showLastButton
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {tags?.map((tag) => (
          <Tag key={tag.id} {...tag} />
        ))}
        <Button endIcon={<AddIcon />}>Добавить тег</Button>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {documents?.map((document) => (
          <Document key={document.id} {...document} />
        ))}
      </Box>
    </>
  );
};
