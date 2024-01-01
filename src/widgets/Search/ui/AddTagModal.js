import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useState } from "react";
import { useStore } from "../../../shared/hooks";

export const AddTagModal = (props) => {
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const { tags, setTags } = useStore();

  const handleTagAdd = (tag) => {
    fetch(`${process.env.REACT_APP_API_URL}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tag),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw response.json();
        }
      })
      .then((createdTag) => {
        setTags([
          ...tags,
          {
            name: tag.name,
            id: createdTag.id,
            documentCount: 0,
            selected: false,
          },
        ]);
        setIsAddTagModalOpen(!isAddTagModalOpen);
        setError(null);
      })
      .catch((error) => {
        console.log(typeof error);
        console.log(error);
        error.then((errMsg) => setError(errMsg));
      });
  };
  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setIsAddTagModalOpen(!isAddTagModalOpen)}
      >
        Добавить тег
      </Button>
      <Modal
        open={isAddTagModalOpen}
        onClose={() => setIsAddTagModalOpen(!isAddTagModalOpen)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Добавить тег
          </Typography>
          <TextField
            label="Имя нового тега"
            helperText={error ? `Ошибка: ${error}` : undefined}
            error={error ? true : undefined}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <Button
            variant="outlined"
            onClick={() => handleTagAdd({ name: name })}
          >
            Добавить
          </Button>
        </Box>
      </Modal>
    </>
  );
};
