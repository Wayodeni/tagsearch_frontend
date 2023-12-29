import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../shared/hooks";
import Chip from "@mui/material/Chip";

export const Tag = ({ id, selected, name, documentCount }) => {
  const emptyTagNamePlaceholder = "Без тегов";
  const [searchParams, setSearchParams] = useSearchParams();
  const tagsQueryParamName = "tags[]";

  const { tags, setTags } = useStore();

  const handleTagDelete = () => {
    fetch(`${process.env.REACT_APP_API_URL}/tags/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok)
          setTags(tags.filter(({ name: curName }) => curName !== name));
        throw response.text();
      })
      .catch((text) => console.log(text));
  };

  const handleTagClick = () => {
    if (!searchParams.getAll(tagsQueryParamName).includes(name))
      setSearchParams((prev) => {
        prev.append(tagsQueryParamName, name);
        return prev;
      });
    else
      setSearchParams((prev) => {
        const allTagParams = prev
          .getAll(tagsQueryParamName)
          .filter((selectedName) => selectedName !== name);
        prev.delete(tagsQueryParamName);
        allTagParams.map((tag) => prev.append(tagsQueryParamName, tag));
        return prev;
      });

    const indexOfCurrentTag = tags.findIndex(
      ({ name: stateTag }) => stateTag === name,
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

  return (
    <Chip
      color={selected ? "success" : "default"}
      label={`${name ? name : emptyTagNamePlaceholder} ${
        documentCount ? ` (${documentCount})` : ""
      }`}
      onClick={handleTagClick}
      onDelete={selected ? undefined : handleTagDelete}
    />
  );
};
