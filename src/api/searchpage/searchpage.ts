// Example of an Express.js application using Prisma to call the stored procedure

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

// Define a route to call the stored procedure
app.get('/searchpage', async (req, res) => {
  try {
    const { searchpage, usertype } = req.query;

    // Call the stored procedure using the Prisma client
    const result = await prisma.$queryRaw`CALL sp_searchpage(${searchpage}, ${usertype})`;

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
