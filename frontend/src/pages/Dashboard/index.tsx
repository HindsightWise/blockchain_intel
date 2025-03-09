import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import { Wallet, SwapHoriz, PriceCheck, AccountBalance } from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppDispatch, RootState } from '../../store';
import { fetchRecentTransactions } from '../../store/slices/transactionSlice';
import { fetchEntities } from '../../store/slices/entitySlice';
import StatCard from '../../components/StatCard';

// Mock data for charts
const transactionVolumeData = [
  { date: '2023-01-01', volume: 1200 },
  { date: '2023-01-02', volume: 1800 },
  { date: '2023-01-03', volume: 1600 },
  { date: '2023-01-04', volume: 2200 },
  { date: '2023-01-05', volume: 2500 },
  { date: '2023-01-06', volume: 2100 },
  { date: '2023-01-07', volume: 2800 },
];

const entityActivityData = [
  { date: '2023-01-01', exchanges: 850, defi: 320, unknown: 150 },
  { date: '2023-01-02', exchanges: 740, defi: 280, unknown: 190 },
  { date: '2023-01-03', exchanges: 900, defi: 350, unknown: 120 },
  { date: '2023-01-04', exchanges: 1100, defi: 400, unknown: 180 },
  { date: '2023-01-05', exchanges: 950, defi: 380, unknown: 210 },
  { date: '2023-01-06', exchanges: 1050, defi: 420, unknown: 170 },
  { date: '2023-01-07', exchanges: 1200, defi: 450, unknown: 190 },
];

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recentTransactions, loading: transactionsLoading } = useSelector((state: RootState) => state.transaction);
  const { entities, loading: entitiesLoading } = useSelector((state: RootState) => state.entity);

  useEffect(() => {
    dispatch(fetchRecentTransactions());
    dispatch(fetchEntities());
  }, [dispatch]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Transactions"
            value="1.2M"
            icon={<SwapHoriz />}
            change={+5.7}
            color="#3f8cff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Addresses"
            value="245K"
            icon={<Wallet />}
            change={+2.1}
            color="#00c853"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Transaction"
            value="0.52 ETH"
            icon={<PriceCheck />}
            change={-1.2}
            color="#ff9100"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Entities Identified"
            value="872"
            icon={<AccountBalance />}
            change={+12.5}
            color="#d500f9"
          />
        </Grid>
      </Grid>

      {/* Charts and Data */}
      <Grid container spacing={3}>
        {/* Transaction Volume Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Transaction Volume" />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={transactionVolumeData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#ccc' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fill: '#ccc' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${value} ETH`, 'Volume']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#3f8cff" fill="#3f8cff33" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Entity Activity Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Entity Activity" />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={entityActivityData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#ccc' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fill: '#ccc' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  />
                  <Area type="monotone" dataKey="exchanges" stackId="1" stroke="#3f8cff" fill="#3f8cff33" />
                  <Area type="monotone" dataKey="defi" stackId="1" stroke="#00c853" fill="#00c85333" />
                  <Area type="monotone" dataKey="unknown" stackId="1" stroke="#ff9100" fill="#ff910033" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Transactions" />
            <Divider />
            {transactionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {recentTransactions.map((transaction) => (
                  <React.Fragment key={transaction.hash}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography noWrap>
                            {transaction.hash.substring(0, 6)}...{transaction.hash.substring(transaction.hash.length - 4)}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" noWrap>
                              From: {transaction.from.substring(0, 6)}...{transaction.from.substring(transaction.from.length - 4)}
                            </Typography>
                            <Typography variant="body2" noWrap>
                              To: {transaction.to.substring(0, 6)}...{transaction.to.substring(transaction.to.length - 4)}
                            </Typography>
                            <Typography variant="body2">
                              {transaction.value} | {new Date(transaction.timestamp).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Card>
        </Grid>

        {/* Top Entities */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Top Entities" />
            <Divider />
            {entitiesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {entities.map((entity) => (
                  <React.Fragment key={entity.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Typography noWrap>
                            {entity.name}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2">
                              Type: {entity.type}
                            </Typography>
                            <Typography variant="body2">
                              Addresses: {entity.addresses.length} | Total Balance: {entity.totalBalance}
                            </Typography>
                            <Typography variant="body2">
                              Confidence: {(entity.confidenceScore * 100).toFixed(0)}%
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;