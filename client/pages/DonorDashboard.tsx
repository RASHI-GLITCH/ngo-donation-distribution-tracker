import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDonation } from '@/context/DonationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, LogOut, Loader2, AlertCircle } from 'lucide-react';

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const { makeDonation, donorTotalDonations, donorDonationHistory, loading } = useDonation();

  const [donationAmount, setDonationAmount] = useState('');
  const [donationCurrency, setDonationCurrency] = useState('USD');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || !userData) {
    navigate('/auth');
    return null;
  }

  const totalDonations = donorTotalDonations(user.uid);
  const donationHistory = donorDonationHistory(user.uid);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDonating(true);

    try {
      const amount = parseFloat(donationAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid donation amount');
      }

      await makeDonation(amount, donationCurrency);
      setDonationAmount('');
      setDonationCurrency('USD');
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make donation');
    } finally {
      setIsDonating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FundHub</h1>
            <p className="text-slate-500 mt-1">Donor Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{userData.displayName}</p>
              <p className="text-xs text-slate-500">{userData.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-slate-100"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Total Donations Card */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-pink-50 to-red-50">
            <CardHeader>
              <CardDescription className="text-base">Total Donated</CardDescription>
              <CardTitle className="text-4xl mt-2">
                {totalDonations > 0 ? `$${totalDonations.toFixed(2)}` : '$0.00'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                {donationHistory.length} donation{donationHistory.length !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          {/* Make Donation Card */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>Support causes you care about</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600">
                    <Heart className="mr-2 h-5 w-5" />
                    Donate Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Make a Donation</DialogTitle>
                    <DialogDescription>
                      Enter the amount and currency for your donation
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleDonate} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter donation amount"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        disabled={isDonating}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={donationCurrency} onValueChange={setDonationCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isDonating}
                    >
                      {isDonating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Donation'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Donation History */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>
              {loading ? 'Loading...' : `${donationHistory.length} donation${donationHistory.length !== 1 ? 's' : ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : donationHistory.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No donations yet. Start by making your first donation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donationHistory.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Donation</p>
                        <p className="text-sm text-slate-500">
                          {donation.createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {donation.amount.toFixed(2)} {donation.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fund Allocations Info */}
        <Card className="shadow-lg border-0 mt-8 bg-blue-50">
          <CardHeader>
            <CardTitle>Fund Allocations</CardTitle>
            <CardDescription>
              See how NGO admins are using donations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Fund allocation details from NGO admins will appear here in real-time.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
