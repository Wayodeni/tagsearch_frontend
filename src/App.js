import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useState, useContext, useEffect } from "react";
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

function App() {
  const [tags, setTags] = useState([]);
  const [documents, setDocuments] = useState([]);

  const emptyTagNamePlaceholder = "Без тегов"

  useEffect(() => fetchSearchResults(""), [])

  const fetchSearchResults = (query) => {
    fetch(`http://localhost:8080/api/v1/search?query=${query}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw response
      })
      .then((searchResponse) => {
        setTags(searchResponse.tags?.sort((a, b) => b.documentCount - a.documentCount));
        setDocuments(searchResponse.documents)
      })
  }

  const handleSearchbarChange = (query) => {
    fetchSearchResults(query);
    console.log(query);
  }

  const getTagName = (tagContent) => tagContent.split(' ').slice(0, -1).join(' ')

  const handleTagClick = (tagContent) => {
    let tagName = getTagName(tagContent)
    let indexOfCurrentTag = tags.findIndex(stateTag => stateTag.name === tagName)
    if (tagName === emptyTagNamePlaceholder) {
      indexOfCurrentTag = tags.findIndex(stateTag => stateTag.name === '')
    }
    console.log(indexOfCurrentTag, tagContent)
    setTags([
      ...tags.slice(0, indexOfCurrentTag),
      {
        ...tags[indexOfCurrentTag],
        selected: true,
      },
      ...tags.slice(indexOfCurrentTag + 1),
    ])
  }

  return (
    <>
    <TextField 
      id="outlined-basic" 
      label="Поисковый запрос" 
      variant="outlined" 
      onChange={(e) => handleSearchbarChange(e.target.value)}
      sx={{width: '100%'}}
    />
    <Typography>Найдено документов: {documents?.length} Тегов: {tags?.length}</Typography>
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start'}}>
      {tags?.map((tag) => 
        <>
          <Chip key={tag.id} color={tag.selected ? 'success' : 'default'} label={`${tag.name ? tag.name : (emptyTagNamePlaceholder)} (${tag.documentCount})`} onClick={e => handleTagClick(e.target.innerText)}></Chip>
        </>
      )}
    </Box>
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      {documents?.map((document) => 
        <Box sx={{mt: 1}}>
          <Chip  key={document.id} label={`${document.name ? document.name : ("Документ без названия")}`} size="small" variant="outlined"/>
          <Typography align={'justify'}>{document.body}</Typography>
          <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
            {document.tags?.map((tag) => <Chip label={tag.name + ` (${tags.find(stateTag => stateTag.name == tag.name)?.documentCount})`} size="small" />)}
          </Box>
        </Box>
      )}
    </Box>
    
    </>
  );
}

export default App;
