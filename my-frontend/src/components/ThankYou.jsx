import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ThankYou() {
  const navigate = useNavigate();

  return (
    <Box maxWidth="500px" mx="auto" mt={8}>
      <Paper elevation={4} sx={{ p: 5, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom color="success.main">
          Thank You!
        </Typography>
        <Typography variant="h6" gutterBottom>
          Your order has been placed successfully.
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          We appreciate your business. You will receive an email confirmation soon.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </Paper>
    </Box>
  );
}

export default ThankYou;
