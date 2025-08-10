import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Table } from 'react-bootstrap';

interface WalletBalance {
  confirmed: number;
  pending: number;
  total: number;
}

interface WithdrawalHistory {
  id: string;
  amount: number;
  status: string;
  timestamp: string;
  txHash?: string;
}

export const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState<WalletBalance>({ confirmed: 0, pending: 0, total: 0 });
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [btcAddress, setBtcAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch balances and withdrawal history on component mount
  useEffect(() => {
    fetchBalance();
    fetchWithdrawalHistory();
    // Set up polling every minute
    const interval = setInterval(() => {
      fetchBalance();
      fetchWithdrawalHistory();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
      } else {
        setError('Failed to fetch balance');
      }
    } catch (err) {
      setError('Failed to fetch balance');
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const response = await fetch('/api/withdrawals/history');
      const data = await response.json();
      if (data.success) {
        setWithdrawalHistory(data.history);
      }
    } catch (err) {
      setError('Failed to fetch withdrawal history');
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          destinationAddress: btcAddress
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(`Withdrawal request submitted successfully! ID: ${data.withdrawalId}`);
        setWithdrawAmount('');
        setBtcAddress('');
        // Refresh balance and history
        fetchBalance();
        fetchWithdrawalHistory();
      } else {
        setError(data.error || 'Failed to process withdrawal');
      }
    } catch (err) {
      setError('Failed to submit withdrawal request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>Mining Wallet</h2>
      
      {/* Balance Cards */}
      <div className="d-flex gap-4 mb-4">
        <Card className="flex-grow-1">
          <Card.Body>
            <Card.Title>Confirmed Balance</Card.Title>
            <h3>{balance.confirmed.toFixed(8)} BTC</h3>
          </Card.Body>
        </Card>
        <Card className="flex-grow-1">
          <Card.Body>
            <Card.Title>Pending Balance</Card.Title>
            <h3>{balance.pending.toFixed(8)} BTC</h3>
          </Card.Body>
        </Card>
        <Card className="flex-grow-1">
          <Card.Body>
            <Card.Title>Total Balance</Card.Title>
            <h3>{balance.total.toFixed(8)} BTC</h3>
          </Card.Body>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Withdraw Funds</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleWithdraw}>
            <Form.Group className="mb-3">
              <Form.Label>Amount (BTC)</Form.Label>
              <Form.Control
                type="number"
                step="0.00000001"
                min="0.001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Minimum withdrawal: 0.001 BTC
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>BTC Address</Form.Label>
              <Form.Control
                type="text"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                placeholder="Enter BTC address"
                required
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit"
              disabled={isLoading || !withdrawAmount || !btcAddress}
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <Card.Body>
          <Card.Title>Recent Withdrawals</Card.Title>
          <Table responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount (BTC)</th>
                <th>Status</th>
                <th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {withdrawalHistory.map((withdrawal) => (
                <tr key={withdrawal.id}>
                  <td>{new Date(withdrawal.timestamp).toLocaleString()}</td>
                  <td>{withdrawal.amount.toFixed(8)}</td>
                  <td>
                    <span className={`badge bg-${withdrawal.status === 'completed' ? 'success' : 
                                                withdrawal.status === 'pending' ? 'warning' : 
                                                'danger'}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td>
                    {withdrawal.txHash ? (
                      <a
                        href={`https://www.blockchain.com/btc/tx/${withdrawal.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Transaction
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};
