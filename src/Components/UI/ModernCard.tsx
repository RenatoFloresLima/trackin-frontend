import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  elevation?: number;
  sx?: any;
  onClick?: () => void;
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  elevation = 2,
  sx,
  onClick,
}) => {
  const CardComponent = (
    <Card
      elevation={elevation}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: 6,
            }
          : {},
        ...sx,
      }}
      onClick={onClick}
    >
      {(title || subtitle || icon) && (
        <Box
          sx={{
            p: 3,
            pb: 2,
            background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {icon && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #1abc9c 0%, #16a085 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </Box>
            )}
            <Box sx={{ flex: 1 }}>
              {title && (
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
      <CardContent sx={{ p: title || subtitle || icon ? 3 : 0 }}>
        {children}
      </CardContent>
    </Card>
  );

  return CardComponent;
};

export default ModernCard;

