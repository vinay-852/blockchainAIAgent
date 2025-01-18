const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Import Wallet
app.post('/import-wallet', (req, res) => {
    const { privateKey } = req.body;
    try {
        const wallet = new ethers.Wallet(privateKey);
        res.json({ address: wallet.address });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// View Wallet Balance
app.get('/wallet-balance/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const provider = ethers.getDefaultProvider();
        const balance = await provider.getBalance(address);
        res.json({ balance: ethers.utils.formatEther(balance) });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Address Validation
app.post('/validate-address', (req, res) => {
    const { address } = req.body;
    const isValid = ethers.utils.isAddress(address);
    res.json({ isValid });
});

// Send Cryptocurrency
app.post('/send-crypto', async (req, res) => {
    const { privateKey, to, amount } = req.body;
    try {
        const wallet = new ethers.Wallet(privateKey);
        const provider = ethers.getDefaultProvider();
        const walletWithProvider = wallet.connect(provider);
        const tx = await walletWithProvider.sendTransaction({
            to,
            value: ethers.utils.parseEther(amount)
        });
        res.json({ transactionHash: tx.hash });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Transaction History
app.get('/transaction-history/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const provider = ethers.getDefaultProvider();
        const history = await provider.getHistory(address);
        res.json({ history });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check Transaction Status
app.get('/transaction-status/:hash', async (req, res) => {
    const { hash } = req.params;
    try {
        const provider = ethers.getDefaultProvider();
        const receipt = await provider.getTransactionReceipt(hash);
        res.json({ status: receipt ? receipt.status : 'pending' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Estimate Gas Fees
app.get('/estimate-gas', async (req, res) => {
    try {
        const provider = ethers.getDefaultProvider();
        const gasPrice = await provider.getGasPrice();
        res.json({ gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei') });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON format' });
    }
    next();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
