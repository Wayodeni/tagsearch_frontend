import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [tags, setTags] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentsFound, setDocumentsFound] = useState(0);
  const [pagesCount, setPagesCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const emptyTagNamePlaceholder = "Без тегов";
  const tagsQueryParamName = "tags[]";
  const currentPageQueryParamName = "pageNumber";
  const querystringQueryParamName = "query";

  useEffect(() => {
    setCurrentPage(parseInt(searchParams.get(currentPageQueryParamName)));
  }, []);

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams]);

  const fetchSearchResults = () => {
    fetch(
      `http://192.168.12.22:8081/api/v1/search?${searchParams.toString()}`,
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
        if (searchResponse.requestPageIsOutOfBounds) {
          handlePageChange(null, searchResponse.pages);
        }
      });
  };

  const handleTagClick = (tag) => {
    if (
      searchParams
        .getAll(tagsQueryParamName)
        .findIndex((querystringTag) => querystringTag === tag.name) === -1
    ) {
      setSearchParams((prev) => {
        prev.append(tagsQueryParamName, tag.name);
        return prev;
      });
    } else {
      setSearchParams((prev) => {
        let allTagParams = prev
          .getAll(tagsQueryParamName)
          .filter((selectedTagName) => selectedTagName != tag.name);
        prev.delete(tagsQueryParamName);
        allTagParams.map((tag) => prev.append(tagsQueryParamName, tag));
        return prev;
      });
    }

    let indexOfCurrentTag = tags.findIndex(
      (stateTag) => stateTag.name === tag.name
    );

    const getUpdatedTag = () => {
      if (tags[indexOfCurrentTag].selected) {
        return {
          ...tags[indexOfCurrentTag],
          selected: false,
        };
      }
      return {
        ...tags[indexOfCurrentTag],
        selected: true,
      };
    };

    setTags([
      ...tags.slice(0, indexOfCurrentTag),
      getUpdatedTag(),
      ...tags.slice(indexOfCurrentTag + 1),
    ]);
  };

  const handleQuerystringChange = (queryString) => {
    const SYMBOLS_TO_REMOVE = '+-=&|><!(){}[]^"~*?:\\/ ';
    if (SYMBOLS_TO_REMOVE.includes(queryString[queryString.length - 1])) {
      return queryString.slice(0, -1);
    }
    setSearchParams((prev) => {
      prev.set(querystringQueryParamName, queryString);
      return prev;
    });
  };

  const handlePageChange = (e, value) => {
    setCurrentPage(value);
    setSearchParams((prev) => {
      prev.set(currentPageQueryParamName, value);
      return prev;
    });
  };

  return (
    <>
      <TextField
        id="outlined-basic"
        label="Поисковый запрос"
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
          onChange={(e, value) => handlePageChange(e, value)}
          color="primary"
          variant="outlined"
          shape="rounded"
          sx={{
            mb: 2,
            // width: 1,
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
          <>
            <Chip
              key={tag.id}
              color={tag.selected ? "success" : "default"}
              label={`${tag.name ? tag.name : emptyTagNamePlaceholder} (${
                tag.documentCount
              })`}
              onClick={() => handleTagClick(tag)}
            ></Chip>
          </>
        ))}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {documents?.map((document) => (
          <Box sx={{ mt: 1 }}>
            <Chip
              key={document.id}
              label={`${
                document.name ? document.name : "Документ без названия"
              }`}
              size="small"
              variant="outlined"
            />
            <Typography align={"justify"}>{document.body}</Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-start",
                alignItems: "flex-start",
              }}
            >
              {document.tags?.map((tag) => (
                <Chip
                  onClick={() => handleTagClick(tag)}
                  color={
                    tags.find((stateTag) => stateTag.name === tag.name)
                      ?.selected
                      ? "success"
                      : "default"
                  }
                  label={
                    (tag.name ? tag.name : emptyTagNamePlaceholder) +
                    ` (${
                      tags.find((stateTag) => stateTag.name === tag.name)
                        ?.documentCount
                    })`
                  }
                  size="small"
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
};

export default Search;
