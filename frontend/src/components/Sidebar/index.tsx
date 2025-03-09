import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  BubbleChart as VisualizerIcon,
  Business as EntityIcon,
  BarChart as AnalyticsIcon,
  Notifications as AlertsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { toggleSidebar, setActiveTab } from '../../store/slices/uiSlice';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
  const { sidebarOpen, activeTab } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string, tab: string) => {
    navigate(path);
    dispatch(setActiveTab(tab));
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', tab: 'dashboard' },
    { text: 'Address Search', icon: <SearchIcon />, path: '/search', tab: 'search' },
    { text: 'Transaction Visualizer', icon: <VisualizerIcon />, path: '/visualizer', tab: 'visualizer' },
    { text: 'Entity Explorer', icon: <EntityIcon />, path: '/entities', tab: 'entities' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics', tab: 'analytics' },
    { text: 'Alerts', icon: <AlertsIcon />, path: '/alerts', tab: 'alerts' },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#1E1E1E',
          color: '#fff',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{ height: 32, width: 32, mr: 1 }}
          />
          <Box sx={{ fontWeight: 'bold', fontSize: 18 }}>Blockchain Intel</Box>
        </Box>
        <IconButton onClick={() => dispatch(toggleSidebar())} size="small" sx={{ color: '#fff' }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider sx={{ backgroundColor: '#333' }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={activeTab === item.tab}
              onClick={() => handleNavigation(item.path, item.tab)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#333',
                  '&:hover': {
                    backgroundColor: '#444',
                  },
                },
                '&:hover': {
                  backgroundColor: '#2a2a2a',
                },
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ backgroundColor: '#333', mt: 'auto' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={activeTab === 'settings'}
            onClick={() => handleNavigation('/settings', 'settings')}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#333',
                '&:hover': {
                  backgroundColor: '#444',
                },
              },
              '&:hover': {
                backgroundColor: '#2a2a2a',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#fff' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;