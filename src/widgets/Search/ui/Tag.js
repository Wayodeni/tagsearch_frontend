import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { TextField } from "@mui/material";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/system/Box";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../shared/hooks";
export const Tag = ({ id, selected, name: initialName, documentCount }) => {
  const emptyTagNamePlaceholder = "Без тегов";
  const [searchParams, setSearchParams] = useSearchParams();
  const tagsQueryParamName = "tags[]";

  const { tags, setTags } = useStore();

  const [editable, setEditable] = useState(false);
  const [name, setName] = useState(initialName);

  const handleTagDelete = () => {
    fetch(`${process.env.REACT_APP_API_URL}/tags/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok)
          setTags(tags.filter(({ name: curName }) => curName !== initialName));
        throw response.text();
      })
      .catch((text) => console.log(text));
  };

  const handleTagClick = () => {
    if (!searchParams.getAll(tagsQueryParamName).includes(initialName))
      setSearchParams((prev) => {
        prev.append(tagsQueryParamName, initialName);
        return prev;
      });
    else
      setSearchParams((prev) => {
        const allTagParams = prev
          .getAll(tagsQueryParamName)
          .filter((selectedName) => selectedName !== initialName);
        prev.delete(tagsQueryParamName);
        allTagParams.map((tag) => prev.append(tagsQueryParamName, tag));
        return prev;
      });

    const indexOfCurrentTag = tags.findIndex(
      ({ name: stateTag }) => stateTag === initialName
    );

    const getUpdatedTag = () => {
      if (tags[indexOfCurrentTag].selected)
        return {
          ...tags[indexOfCurrentTag],
          selected: false,
        };
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

  const handleTagUpdate = (newName) => {
    fetch(`${process.env.REACT_APP_API_URL}/tags/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
      .then((response) => {
        if (response.ok) {
          const indexOfCurrentTag = tags.findIndex(
            ({ name: stateTag }) => stateTag === initialName
          );
          setTags([
            ...tags.slice(0, indexOfCurrentTag),
            { ...tags[indexOfCurrentTag], name: name },
            ...tags.slice(indexOfCurrentTag + 1),
          ]);
          setEditable(!editable);
        } else {
          throw response.json();
        }
      })
      .catch((e) => e.json().then((errorMsg) => alert(errorMsg)));
  };

  return editable ? (
    <Box>
      <TextField
        size="small"
        onChange={(e) => setName(e.target.value)}
        value={name}
      ></TextField>
      <IconButton onClick={() => handleTagUpdate(name)}>
        <CheckIcon></CheckIcon>
      </IconButton>
      <IconButton
        onClick={() => {
          setEditable(!editable);
          setName(initialName);
        }}
      >
        <CloseIcon></CloseIcon>
      </IconButton>
    </Box>
  ) : (
    <Box sx={{ boxSizing: "border-box" }}>
      <Chip
        color={selected ? "success" : "default"}
        label={`${initialName} ${documentCount}`}
        onClick={handleTagClick}
        onDelete={selected ? undefined : handleTagDelete}
        deleteIcon={<DeleteIcon />}
      />
      {selected ? undefined : (
        <IconButton onClick={() => setEditable(!editable)}>
          <EditIcon></EditIcon>
        </IconButton>
      )}
    </Box>
  );
};
