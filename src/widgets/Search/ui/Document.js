import { Box, Chip, Typography } from "@mui/material";
import { useStore } from "../../../shared/hooks";
import { Tag } from "./Tag";

export const Document = ({ tags, name, body }) => {
  const { tags: allTags } = useStore();

  const fullTags = allTags.filter(({ id }) =>
    tags?.some((tag) => id === tag.id),
  );

  return (
    <Box sx={{ mt: 1 }}>
      <Chip
        label={`${name ? name : "Документ без названия"}`}
        size="small"
        variant="outlined"
      />
      <Typography align={"justify"}>{body}</Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        {fullTags?.map((tag) => (
          <Tag key={tag.id} {...tag} />
        ))}
      </Box>
    </Box>
  );
};
