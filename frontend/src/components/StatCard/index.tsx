import React from 'react';
import { Box, Card, CardContent, Typography, Avatar } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, color }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {change > 0 ? (
                <ArrowUpward sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
              )}
              <Typography 
                variant="body2" 
                color={change > 0 ? 'success.main' : 'error.main'}
              >
                {Math.abs(change)}%
              </Typography>
            </Box>
          </Box>
          <Avatar
            sx={{
              backgroundColor: `${color}22`,
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;