import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface BarChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  type: 'bar' | 'pie';
  data: BarChartData[];
  title: string;
  dataKey: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export function AnalyticsChart({ type, data, title, dataKey, colors = DEFAULT_COLORS }: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-lg">
        <p className="text-slate-500">No data available</p>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="w-full h-96 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'pie') {
    return (
      <div className="w-full h-96 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => `$${(value as number).toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '0.5rem',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
