import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Container,
  AppBar,
  Toolbar,
  Paper,
  Divider,
  Alert,
  AlertTitle
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    }
  },
});

const FoodSafetyDashboard = () => {
  const [recalls, setRecalls] = useState({ fda_recalls: [], cpsc_recalls: [], total_count: 0 });
  const [stats, setStats] = useState({ total_recalls: 0, fda_recalls: 0, cpsc_recalls: 0, classifications: {} });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('all');

  // API base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'https://food-safety.up.railway.app/api';

  const fetchRecalls = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE}/recalls?search=${searchTerm}`);
    if (!response.ok) throw new Error('Failed to fetch recalls');
    const result = await response.json();
    
    // Transform the API response to match what your frontend expects
    const transformedData = {
      fda_recalls: result.data.filter(recall => recall.source === 'FDA'),
      cpsc_recalls: result.data.filter(recall => recall.source === 'CPSC'),
      total_count: result.count
    };
    
    setRecalls(transformedData);
  } catch (error) {
    console.error('Error fetching recalls:', error);
    // Set empty data to prevent undefined errors
    setRecalls({ fda_recalls: [], cpsc_recalls: [], total_count: 0 });
  } finally {
    setLoading(false);
  }
};

  const fetchStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    const result = await response.json();
    setStats(result.data); // Extract the data property
     console.log('Stats API response:', result.data);
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    setStats({ total_recalls: 0, fda_recalls: 0, cpsc_recalls: 0, classifications: {} });
  }
};
 useEffect(() => {
    // Change title when component mounts


    document.title = "Food Safety Dashboard";
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchRecalls();
      await fetchStats();
    };
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateData = async () => {
    setUpdating(true);
    try {
      await fetch(`${API_BASE}/update`);
      await fetchRecalls();
      await fetchStats();
    } catch (error) {
      console.error('Error updating data:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = () => {
    fetchRecalls();
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Class I': return 'error';
      case 'Class II': return 'warning';
      case 'Class III': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    if (dateString.length === 8 && !dateString.includes('-')) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return new Date(`${year}-${month}-${day}`).toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };


   var FDAlength;
    var CPSClength;
  const filteredRecalls = () => {
    let allRecalls = [];
    FDAlength = recalls.fda_recalls.length;
    CPSClength = recalls.cpsc_recalls.length;
    
    if (selectedAgency === 'all' || selectedAgency === 'fda') {
      allRecalls = [...allRecalls, ...recalls.fda_recalls.map(r => ({ ...r, agency: 'FDA' }))];
    }
    
    if (selectedAgency === 'all' || selectedAgency === 'cpsc') {
      allRecalls = [...allRecalls, ...recalls.cpsc_recalls.map(r => ({ ...r, agency: 'CSPC' }))];
    }
    
    return allRecalls.sort((a, b) => {
      const dateA = new Date(a.report_date || a.recall_date || 0);
      const dateB = new Date(b.report_date || b.recall_date || 0);
      return dateB - dateA;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <img
              src="/logo.png"
              alt="Food Safety Monitor Logo"
              style={{ width: 50, height: 50, marginRight: 16, borderRadius: '50%' }}
            />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Food Safety Monitor
            </Typography>
            <Button
              color="inherit"
              onClick={updateData}
              disabled={updating}
            >
              {updating ? '🔄 Updating...' : '↻ Update Data'}
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Hero Section */}
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#fff' }}>
            <Typography variant="h4" gutterBottom color="primary">
              Real-time Food Safety Monitoring
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track FDA and USDA food recalls and safety alerts to stay informed about potential health risks
            </Typography>
          </Paper>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Recalls
                  </Typography>
                  <Typography variant="h4" component="div" color="primary">
                    {filteredRecalls().length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    📈 All agencies combined
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    FDA Recalls
                  </Typography>
                  <Typography variant="h4" component="div" color="primary">
                    {FDAlength}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    🏢 Food & Drug Administration
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    CPSC Recalls
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    { CPSClength }
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    🛡️ Consumer Product Safety
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    High Risk (Class I)
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.classifications['Class I'] || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    ⚠️ Serious health hazards
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    placeholder="🔍 Search recalls by product name, company, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    variant="outlined"
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontSize: '0.95rem' 
                      },
                        width: { 
                        xs: '100%',
                        sm: 'clamp(300px, 50vw, 600px)' // Minimum 300px, preferred 50% viewport width, maximum 600px
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Agency</InputLabel>
                    <Select
                      value={selectedAgency}
                      label="Agency"
                      onChange={(e) => setSelectedAgency(e.target.value)}
                    >
                      <MenuItem value="all">All Agencies</MenuItem>
                      <MenuItem value="fda">FDA Only</MenuItem>
                      <MenuItem value="cpsc">CPSC Only</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSearch}
                    size="large"
                  >
                    🔍 Search
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Recalls List */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Food Recalls ({filteredRecalls().length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography color="text.secondary">Loading recalls...</Typography>
                  </Box>
                </Box>
              ) : (
                <Box>
                  {filteredRecalls().map((recall, index) => (
                    <Paper
                      key={recall.id || index}
                      elevation={1}
                      sx={{ p: 3, mb: 2, '&:hover': { elevation: 3, backgroundColor: '#f9f9f9' } }}
                    >
                      {/* Header with badges */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip
                          label={recall.agency}
                          color={recall.agency === 'FDA' ? 'primary' : 'success'}
                          size="small"
                        />
                        {recall.classification && (
                          <Chip
                            label={recall.classification}
                            color={getClassificationColor(recall.classification)}
                            size="small"
                          />
                        )}
                        <Chip
                          label={`📅 ${formatDate(recall.date || recall.date)}`}
                          variant="outlined"
                          size="small"
                        />
                        {recall.status && (
                          <Chip
                            label={recall.status}
                            color={recall.status === 'Ongoing' ? 'warning' : 'default'}
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Box>

                      {/* Product and Company */}
                      <Typography variant="h6" gutterBottom color="primary">
                        {recall.product_description || recall.product_name}
                      </Typography>
                      
                      <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
                        🏢 {recall.company_name}
                      </Typography>

                      {/* Reason */}
                      {(recall.classification === 'Class I') ? (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          <AlertTitle>High Risk Recall</AlertTitle>
                          {recall.reason_for_recall || recall.reason}
                        </Alert>
                      ) : (
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          <strong>Reason:</strong> {recall.reason_for_recall || recall.reason}
                        </Typography>
                      )}

                      {/* Additional Details */}
                      <Grid container spacing={2}>
                        {recall.distribution_pattern && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              📍 <strong>Distribution:</strong> {recall.distribution_pattern}
                            </Typography>
                          </Grid>
                        )}
                        
                        {recall.product_quantity && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              📦 <strong>Quantity:</strong> {recall.product_quantity}
                            </Typography>
                          </Grid>
                        )}

                        {recall.pounds_recalled && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              ⚖️ <strong>Amount:</strong> {recall.pounds_recalled} lbs
                            </Typography>
                          </Grid>
                        )}

                        {recall.recall_number && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              🔢 <strong>Recall #:</strong> {recall.recall_number}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                  
                  {filteredRecalls().length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h3" sx={{ mb: 2 }}>⚠️</Typography>
                      <Typography variant="h6" color="text.secondary">
                        No recalls found matching your criteria
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default FoodSafetyDashboard;