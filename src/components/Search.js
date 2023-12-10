import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import { useSearchParams } from 'react-router-dom';

const Search = () => {
    const [tags, setTags] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [documentsFound, setDocumentsFound] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const emptyTagNamePlaceholder = "Без тегов";

    useEffect(() => {fetchSearchResults()}, [searchParams])
  
    const fetchSearchResults = () => {
      fetch(`http://192.168.12.22:8080/api/v1/search?${searchParams.toString()}`, {
        method: "GET",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw response;
        })
        .then((searchResponse) => {
          console.log("Поисковый запрос: ", searchParams.get("query"))
          setDocumentsFound(searchResponse.documentsFound)
          setTags(searchResponse.tags?.sort((a, b) => b.documentCount - a.documentCount || a.name.localeCompare(b.name)));
          setDocuments(searchResponse.documents);
        });
    };
  
    const handleTagClick = (tag) => {
      if (searchParams.getAll("tags[]").findIndex(querystringTag => querystringTag === tag.name) === -1) {
        setSearchParams(prev => {
          prev.append("tags[]", tag.name)
          return prev
        })
      } else {
        setSearchParams(prev => {
          prev.delete("tags[]", tag.name)
          return prev
        })
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
      if (queryString[queryString.length - 1] === "-" || queryString[queryString.length - 1] === " ") {
        return
      }
      let selectedTags = searchParams.getAll("tags[]")
      setSearchParams({"tags[]": selectedTags, query: queryString})
    }
  
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
                      tag.name +
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
}

export default Search;