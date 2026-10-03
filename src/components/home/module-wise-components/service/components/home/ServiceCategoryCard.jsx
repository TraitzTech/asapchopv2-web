import { Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useRouter } from "next/router";
import NextImage from "components/NextImage";
import useTextEllipsis from "api-manage/hooks/custom-hooks/useTextEllipsis";
import { getModuleId } from "helper-functions/getModuleId";

// Round category tile of the service home / category grids (same look as the featured category card).
const ServiceCategoryCard = ({ id, name, slug, image_full_url, onlyshimmer, onClick }) => {
  const router = useRouter();
  const { ref: textRef, isEllipsed } = useTextEllipsis(name);
  const queryModule = router?.query?.module || router?.query?.module_id;
  const moduleValue = Array.isArray(queryModule)
    ? queryModule[0]
    : queryModule || getModuleId();

  const handleClick = () => {
    if (onClick) {
      onClick({ id, name, slug });
      return;
    }
    router.push({
      pathname: `/home/category/${slug || id}`,
      query: { id, ...(moduleValue ? { module: String(moduleValue) } : {}) },
    });
  };

  return (
    <Stack
      alignItems="center"
      spacing={1}
      onClick={handleClick}
      sx={{ cursor: "pointer", pt: "10px", overflow: "hidden" }}
    >
      <Box
        sx={{
          width: { xs: 56, md: 88 },
          height: { xs: 56, md: 88 },
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          transition: "all ease 0.5s",
          "& img": { width: "100%", height: "100%", objectFit: "cover" },
          "&:hover": {
            boxShadow: "0px 10px 20px rgba(88, 110, 125, 0.1)",
            img: { transform: "scale(1.05)" },
          },
        }}
      >
        {onlyshimmer ? (
          <Skeleton variant="circular" width="100%" height="100%" />
        ) : (
          <NextImage
            src={image_full_url}
            alt={name}
            height={88}
            width={88}
            borderRadius="50%"
            objectFit="cover"
            bg="#ddd"
          />
        )}
      </Box>
      <Tooltip title={isEllipsed ? name : ""} placement="bottom" arrow>
        <Typography
          ref={textRef}
          component="h4"
          fontSize={{ xs: "13px", sm: "14px", md: "16px" }}
          fontWeight="500"
          sx={{
            color: (theme) => theme.palette.neutral[1000],
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { xs: "56px", md: "88px" },
            textAlign: "center",
            transition: "all ease 0.3s",
            "&:hover": { color: "primary.main" },
          }}
        >
          {onlyshimmer ? <Skeleton variant="text" width="50px" /> : name}
        </Typography>
      </Tooltip>
    </Stack>
  );
};

export default ServiceCategoryCard;
