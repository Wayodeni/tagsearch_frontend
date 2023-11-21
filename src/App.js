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
  const [searchBar, setSearchBar] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

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

  useEffect(() => fetchSearchResults(""), [])

  const handleSearchbarChange = (query) => {
    setSearchBar(query);
    fetchSearchResults(query);
    console.log(query);
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
          <Chip key={tag.id} label={`${tag.name ? tag.name : ("Без тегов")} (${tag.documentCount})`}></Chip>
        </>
      )}
    </Box>
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      {documents?.map((document) => 
        <>
          <Chip key={document.id} label={`${document.name ? document.name : ("Документ без названия")}`} size="small" variant="outlined"/>
          <Typography align={'justify'}>{document.body}</Typography>
          <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', alignItems: 'flex-start'}}>
            {document.tags?.map((tag) => <Chip label={tag.name + ` (${tags.find(stateTag => stateTag.name == tag.name)?.documentCount})`} size="small" />)}
          </Box>
        </>
      )}
    </Box>
    
    </>
  );
}

export default App;
