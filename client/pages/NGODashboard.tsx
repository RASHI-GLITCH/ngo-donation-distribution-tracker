import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocation as useLocationContext } from '@/context/LocationContext';
import { useDonation } from '@/context/DonationContext';
import { useNGO } from '@/context/NGOContext';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { Building2, LogOut, Loader2, AlertCircle, TrendingUp, Plus } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Staff Salaries',
  'Office Rent',
  'Education Materials',
  'Medical Supplies',
  'Equipment',
  'Infrastructure',
  'Food & Nutrition',
  'Transportation',
  'Utilities',
  'Other',
];

export default function NGODashboard() {
  const navigate = useNavigate();
  const { user, userData, logout } = useAuth();
  const { location } = useLocationContext();
  const { getDonationsByNGO, donations } = useDonation();
  const { getNGOById, getNGOExpenses, addExpense, ngos } = useNGO();

  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Staff Salaries');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || !userData || userData.role !== 'ngo_admin') {
    navigate('/');
    return null;
  }

  const ngoId = localStorage.getItem('user_ngo_id');
  const selectedNGO = ngoId ? getNGOById(ngoId) : null;

  if (!selectedNGO) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">NGO Not Found</CardTitle>
            <CardDescription className="mt-2">
              Your NGO information could not be found. Please try logging in again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={logout}
              className="w-full"
            >
              Logout & Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ngoIdSelected = selectedNGO.id;
  const donations_to_ngo = getDonationsByNGO(ngoIdSelected);
  const expenses = getNGOExpenses(ngoIdSelected);

  const totalDonations = donations_to_ngo.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingFunds = totalDonations - totalExpenses;

  // Prepare data for expense category chart
  const expensesByCategory = EXPENSE_CATEGORIES.reduce(
    (acc, category) => {
      const amount = expenses
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      if (amount > 0) {
        acc.push({ name: category, value: amount });
      }
      return acc;
    },
    [] as Array<{ name: string; value: number }>
  );

  // Prepare data for monthly expenses chart
  const monthlyExpenses = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;

    const amount = expenses
      .filter((e) => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === date.getMonth() && eDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return { name: monthYear, value: amount };
  }).reverse();

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsAddingExpense(true);

    try {
      const amount = parseFloat(expenseAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid expense amount');
      }
      if (!expenseDescription.trim()) {
        throw new Error('Please provide a description');
      }

      const locationInfo = location ? {
        lat: location.lat,
        lng: location.lng,
        city: location.city,
        country: location.country,
      } : undefined;

      addExpense(ngoIdSelected, amount, expenseCategory, expenseDescription, userData.displayName, locationInfo);

      setExpenseAmount('');
      setExpenseCategory('Staff Salaries');
      setExpenseDescription('');
      setIsExpenseDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
    } finally {
      setIsAddingExpense(false);
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
            <p className="text-slate-500 mt-1">NGO Admin Dashboard - {selectedNGO.name}</p>
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
        {/* Current Location Display */}
        {location && (
          <Card className="shadow-lg border-0 mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="text-sm text-slate-600">Staff Location</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {location.city || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    {location.country && `, ${location.country}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    All expenses will be recorded from this location for transparency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Donations */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardDescription className="text-base">Total Donations Received</CardDescription>
              <CardTitle className="text-4xl mt-2">
                ${totalDonations.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                From {donations_to_ngo.length} donor{donations_to_ngo.length !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader>
              <CardDescription className="text-base">Total Expenses</CardDescription>
              <CardTitle className="text-4xl mt-2">
                ${totalExpenses.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          {/* Remaining Funds */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardDescription className="text-base">Remaining Funds</CardDescription>
              <CardTitle className="text-4xl mt-2">
                ${remainingFunds.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                Available balance
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Expense Button */}
        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="mb-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
              <Plus className="mr-2 h-5 w-5" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Expense</DialogTitle>
              <DialogDescription>
                Log an expense for {selectedNGO.name}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="exp-amount">Expense Amount</Label>
                <Input
                  id="exp-amount"
                  type="number"
                  placeholder="Enter expense amount"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  disabled={isAddingExpense}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp-category">Category</Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exp-description">Description</Label>
                <Textarea
                  id="exp-description"
                  placeholder="e.g., Monthly salary for 5 teachers"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  disabled={isAddingExpense}
                  required
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isAddingExpense}
              >
                {isAddingExpense ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Expense'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Analytics Section */}
        <div className="space-y-8">
          {/* Expense by Category Chart */}
          {expensesByCategory.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Expense Distribution by Category
                </CardTitle>
                <CardDescription>
                  How your expenses are distributed across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart
                  type="pie"
                  data={expensesByCategory}
                  title="Expenses by Category"
                  dataKey="value"
                />
              </CardContent>
            </Card>
          )}

          {/* Monthly Expenses Chart */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Monthly Expense Trend
              </CardTitle>
              <CardDescription>
                Expense spending over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsChart
                type="bar"
                data={monthlyExpenses}
                title="Monthly Expenses"
                dataKey="value"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Donations */}
        <Card className="shadow-lg border-0 mt-8">
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>
              {donations_to_ngo.length} donation{donations_to_ngo.length !== 1 ? 's' : ''} received
            </CardDescription>
          </CardHeader>
          <CardContent>
            {donations_to_ngo.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No donations received yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {donations_to_ngo.slice(0, 5).map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{donation.donorName}</p>
                        <p className="text-sm text-slate-500">
                          {donation.createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Type: <span className="font-semibold">{donation.donationType}</span>
                        </p>
                        {donation.location && (
                          <p className="text-xs text-slate-400 mt-1">
                            📍 {donation.location.city || `${donation.location.lat.toFixed(4)}, ${donation.location.lng.toFixed(4)}`}
                            {donation.location.country && `, ${donation.location.country}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {donation.amount} {donation.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card className="shadow-lg border-0 mt-8">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No expenses recorded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors border-l-4 border-orange-500"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{expense.category}</p>
                        <p className="text-sm text-slate-600">{expense.description}</p>
                      </div>
                      <p className="font-bold text-slate-900">
                        ${expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>
                        {expense.createdAt.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })} by {expense.uploadedBy}
                      </p>
                      {expense.location && (
                        <p className="text-slate-400">
                          📍 {expense.location.city || `${expense.location.lat.toFixed(4)}, ${expense.location.lng.toFixed(4)}`}
                          {expense.location.country && `, ${expense.location.country}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
