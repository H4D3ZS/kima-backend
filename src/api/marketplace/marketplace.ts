// Example of an Express.js application using Prisma to call the stored procedure

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

// Define a route to call the stored procedure
app.get('/marketplace', async (req, res) => {
  try {
    const { searchdata, category } = req.query;

    // Call the stored procedure using the Prisma client
    const result = await prisma.$queryRaw`CALL sp_marketplace(${searchdata}, ${category})`;

    // Send the result as JSON
    res.json(result);
  } catch (error) {
    // Handle any errors
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

app.listen(3000, () => {
  console.log('Express server is listening on port 3000');
});
