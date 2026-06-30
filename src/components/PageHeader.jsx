import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * Consistent page header used across patient portal screens.
 *
 * Provides a responsive title, optional icon, optional subtitle,
 * and an optional actions area aligned to the right on larger screens.
 */
const PageHeader = ({ title, icon, subtitle, actions }) => (
  <Box
    sx={{
      mb: { xs: 3, sm: 4 },
      mt: { xs: 1, sm: 2 },
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: 2,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {icon && (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            color: 'primary.main',
            fontSize: { xs: 32, sm: 40 },
            lineHeight: 1,
          }}
        >
          {React.cloneElement(icon, {
            sx: { fontSize: { xs: 32, sm: 40 } },
          })}
        </Box>
      )}
      <Box>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
    {actions && (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>
    )}
  </Box>
);

export default PageHeader;
