import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocation as useLocationContext } from '@/context/LocationContext';
import { useDonation } from '@/context/DonationContext';
import { useNGO } from '@/context/NGOContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Users, TrendingUp, BarChart3, PieChart, Loader2 } from 'lucide-react';
import { AnalyticsChart } from '@/components/AnalyticsChart';

export default function AppAdminDashboard() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { location } = useLocationContext();
  const { donations, loading } = useDonation();
  const { ngos, expenses } = useNGO();

  if (!userData || userData.role !== 'app_admin') {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalDonors = new Set(donations.map((d) => d.donorId)).size;
  const totalNGOs = ngos.length;

  // Group donations by NGO
  const donationsByNGO = donations.reduce(
    (acc, donation) => {
      const existing = acc.find((d) => d.ngoId === donation.ngoId);
      if (existing) {
        existing.total += donation.amount;
        existing.count += 1;
      } else {
        acc.push({
          ngoId: donation.ngoId,
          name: donation.ngoName,
          total: donation.amount,
          count: 1,
        });
      }
      return acc;
    },
    [] as Array<{ ngoId: string; name: string; total: number; count: number }>
  );

  // Group expenses by category
  const expensesByCategory = expenses.reduce(
    (acc, expense) => {
      const existing = acc.find((e) => e.category === expense.category);
      if (existing) {
        existing.total += expense.amount;
        existing.count += 1;
      } else {
        acc.push({
          category: expense.category,
          total: expense.amount,
          count: 1,
        });
      }
      return acc;
    },
    [] as Array<{ category: string; total: number; count: number }>
  );

  // Monthly donations data
  const monthlyDonations = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const monthYear = `${month} ${year}`;

    const amount = donations
      .filter((d) => {
        const dDate = new Date(d.createdAt);
        return dDate.getMonth() === date.getMonth() && dDate.getFullYear() === date.getFullYear();
      })
      .reduce((sum, d) => sum + d.amount, 0);

    return { name: monthYear, value: amount };
  }).reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">FundHub</h1>
            <p className="text-slate-500 mt-1">Platform Admin Dashboard</p>
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
                  <p className="text-sm text-slate-600">Admin Location</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {location.city || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                    {location.country && `, ${location.country}`}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Platform admin tracking location for system monitoring
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Donations */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-base">Total Donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${totalDonations.toFixed(2)}
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {donations.length} transaction{donations.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Total Expenses */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-base">Total Expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                ${totalExpenses.toFixed(2)}
              </div>
              <p className="text-sm text-slate-600 mt-2">
                {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Active Donors */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-base">Active Donors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {totalDonors}
              </div>
              <p className="text-sm text-slate-600 mt-2">Unique donor{totalDonors !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>

          {/* Partner NGOs */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-base">Partner NGOs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {totalNGOs}
              </div>
              <p className="text-sm text-slate-600 mt-2">NGO{totalNGOs !== 1 ? 's' : ''} on platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Fund Flow Summary */}
        <Card className="shadow-lg border-0 mb-8 bg-gradient-to-r from-slate-50 to-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Fund Flow Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <p className="text-sm text-slate-600 mb-2">Total Raised</p>
                <p className="text-3xl font-bold text-slate-900">${totalDonations.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Total Spent</p>
                <p className="text-3xl font-bold text-slate-900">${totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-2">Net Balance</p>
                <p className="text-3xl font-bold text-slate-900">
                  ${(totalDonations - totalExpenses).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-6 w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-orange-500 h-full transition-all duration-500"
                style={{
                  width: totalDonations > 0 ? `${(totalExpenses / totalDonations) * 100}%` : '0%',
                }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2 text-right">
              {totalDonations > 0 ? `${((totalExpenses / totalDonations) * 100).toFixed(1)}%` : '0%'} of donations spent
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Donations by NGO */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-6 w-6" />
                Donations by NGO
              </CardTitle>
              <CardDescription>
                Distribution of donations across NGOs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : donationsByNGO.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No donations yet</p>
                </div>
              ) : (
                <AnalyticsChart
                  type="pie"
                  data={donationsByNGO.map((d) => ({ name: d.name, value: d.total }))}
                  title="Donations by NGO"
                  dataKey="value"
                />
              )}
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Expenses by Category
              </CardTitle>
              <CardDescription>
                How expenses are distributed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : expensesByCategory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No expenses yet</p>
                </div>
              ) : (
                <AnalyticsChart
                  type="pie"
                  data={expensesByCategory.map((e) => ({ name: e.category, value: e.total }))}
                  title="Expenses by Category"
                  dataKey="value"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Donations Trend */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Monthly Donation Trend
            </CardTitle>
            <CardDescription>
              Donation activity over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <AnalyticsChart
                type="bar"
                data={monthlyDonations}
                title="Monthly Donations"
                dataKey="value"
              />
            )}
          </CardContent>
        </Card>

        {/* Top NGOs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Top NGOs by Donations
              </CardTitle>
              <CardDescription>
                NGOs receiving the most donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : donationsByNGO.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No donations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {donationsByNGO
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5)
                    .map((ngo) => (
                      <div
                        key={ngo.ngoId}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{ngo.name}</p>
                          <p className="text-xs text-slate-500">
                            {ngo.count} donation{ngo.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">
                            ${ngo.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Expense Categories */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Top Expense Categories
              </CardTitle>
              <CardDescription>
                Categories with highest spending
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
              ) : expensesByCategory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">No expenses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expensesByCategory
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5)
                    .map((expense) => (
                      <div
                        key={expense.category}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900">{expense.category}</p>
                          <p className="font-bold text-slate-900">
                            ${expense.total.toFixed(2)}
                          </p>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 to-red-500 h-full"
                            style={{
                              width: totalExpenses > 0 ? `${(expense.total / totalExpenses) * 100}%` : '0%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
