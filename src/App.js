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
  const [selectedTags, setSelectedTags] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState('');

  const emptyTagNamePlaceholder = "Без тегов";

  useEffect(() => fetchSearchResults(), [query, selectedTags])

  const fetchSearchResults = () => {
    fetch(`http://localhost:8080/api/v1/search?${query != '' ? 'query=' + query : ''}${getTagQueryparams(tags?.filter(tag => tag.selected))}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((searchResponse) => {
        console.log("Поисковый запрос: ", query)
        setTags(getUpdatedTags(searchResponse.tags).sort((a, b) => b.documentCount - a.documentCount || a.name.localeCompare(b.name)));
        setDocuments(searchResponse.documents);
      });
  };

  const getTagQueryparams = (tags) => {
    let queryString = ''
    tags?.map(tag => queryString += `&tags[]=${tag.name}`)
    return queryString
  }

  const getUpdatedTags = (foundTags) => {
    let selectedTags = tags?.map((tag) => (tag.selected ? tag : undefined)).filter((tag) => tag)
    if (foundTags === undefined) {
      console.log("foundTags===undefined")
      return selectedTags?.map(tag => ({...tag, documentCount: 0}))
    }

    console.log('Найденные теги:', foundTags, 'Выбранные теги:', selectedTags);

    if (selectedTags?.length > 0) {
      let selectedInFound = selectedTags?.map((selectedTag) => foundTags?.find((tag) => tag.name === selectedTag.name)).filter(tag => tag);
      console.log('Выбранные в найденных: ', selectedInFound);

      let selectedThatAreNotInFound = selectedTags?.map((selectedTag) => {
        let selectedTagFoundInFoundTags = foundTags?.find((tag) => tag.name === selectedTag.name)
        if (selectedTagFoundInFoundTags === undefined) {
          return ({...selectedTag, documentCount: 0})
        }
      }).filter(tag => tag);
      console.log('Выбранные, которых нет в найденных: ', selectedThatAreNotInFound);

      let foundWithoutSelected = foundTags?.filter(foundTag => !selectedInFound.includes(foundTag))
      console.log('Найденные без выбранных: ', foundWithoutSelected);

      let selectedInFoundWithSelectedDefined = selectedInFound.map(tag => ({...tag, selected: true}))
      console.log('Выбранные в найденных с добавленным selected: ', selectedInFoundWithSelectedDefined);

      let foundWithSelected = foundWithoutSelected?.concat(selectedThatAreNotInFound).concat(selectedInFoundWithSelectedDefined)

      return foundWithSelected
    }

    return foundTags;
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
    setSelectedTags(tags?.filter(tag => tag.selected))
  };

  return (
    <>
      <TextField
        id="outlined-basic"
        label="Поисковый запрос"
        variant="outlined"
        onChange={(e) => setQuery(e.target.value)}
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
