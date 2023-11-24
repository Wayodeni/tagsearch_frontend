import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { useState, useContext, useEffect } from "react";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

function App() {
  const [tags, setTags] = useState([]);
  const [documents, setDocuments] = useState([]);

  const emptyTagNamePlaceholder = "Без тегов";

  useEffect(() => fetchSearchResults(""), []);

  const fetchSearchResults = (query) => {
    fetch(`http://localhost:8080/api/v1/search?query=${query}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((searchResponse) => {
        updateTags(
          searchResponse.tags?.sort((a, b) => b.documentCount - a.documentCount)
        );
        setDocuments(searchResponse.documents);
      });
  };

  const updateTags = (foundTags) => {
    let selectedTagNames = tags
      ?.map((tag) => (tag.selected ? tag.name : undefined))
      .filter((tag) => tag);
    setTags(
      foundTags?.map((tag) =>
        selectedTagNames?.includes(tag.name) ? { ...tag, selected: true } : tag
      )
    );
  };

  const handleTagClick = (tag) => {
    let tagName = tag.name;
    let indexOfCurrentTag = tags.findIndex(
      (stateTag) => stateTag.name === tagName
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

  return (
    <>
      <TextField
        id="outlined-basic"
        label="Поисковый запрос"
        variant="outlined"
        onChange={(e) => fetchSearchResults(e.target.value)}
        sx={{ width: "100%" }}
      />
      <Typography>
        Найдено документов: {documents?.length} Тегов: {tags?.length}
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
                      tags.find((stateTag) => stateTag.name == tag.name)
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

export default App;
