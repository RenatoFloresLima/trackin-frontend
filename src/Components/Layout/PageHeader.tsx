import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  leading?: ReactNode;
  spacing?: number;
}

const PageHeader = ({
  title,
  subtitle,
  action,
  leading,
  spacing = 1.5,
}: PageHeaderProps) => {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      spacing={spacing}
      mb={3}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        {leading && <Box>{leading}</Box>}
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
      {action && <Box>{action}</Box>}
    </Stack>
  );
};

export default PageHeader;

