import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

// Middleware to parse JSON request bodies (if you need it later for POST requests, etc.)
app.use(cors());
app.use(express.json());

app.get('/api/account/:id', async (req: Request, res: Response) => {
    const accountId = req.params.id;

    if (!accountId) {
        return res.status(400).json({ error: 'Invalid account ID.  Must be a number.' });
    }

    const coinbaseResponse = await fetch(
        'https://api.developer.coinbase.com/rpc/v1/base-sepolia/e4GEzBA8dqtYnNbxD7uhRqY8WGwSpRCv',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'cdp_listBalances',
                params: [{ address: `${accountId}`, pageToken: '', pageSize: 20 }],
            }),
        }
    );
    console.log('received', coinbaseResponse);
    const coinbaseData = await coinbaseResponse.json();
    console.log('data is ', coinbaseData);
    res.json(coinbaseData.result.balances);
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Example of a POST request handler (if you need it later)
/*
app.post('/api/account', (req: Request, res: Response) => {
  const accountData = req.body; // Get data from the request body

  // ... Process the account data (e.g., save to database) ...

  res.status(201).json({ message: 'Account created', accountId: 123 }); // Send a success response
});
*/
