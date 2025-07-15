import { Suspense } from 'react';
import { Activity, Users, FileText, TrendingUp, Zap, Clock, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalAnalyses: number;
  activeUsers: number;
  averageAccuracy: number;
  reportsGenerated: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  return {
    totalAnalyses: 12847,
    activeUsers: 2341,
    averageAccuracy: 94.7,
    reportsGenerated: 8962
  };
}

function StatCard({ title, value, icon, trend, color }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${color} rounded-xl`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-slate-400 text-sm">{title}</p>
    </div>
  );
}

function RecentActivity() {
  const activities = [
    { type: 'analysis', message: 'AI completed roof inspection for property #2847', time: '2 minutes ago', status: 'completed' },
    { type: 'report', message: 'Storm damage report generated for Johnson residence', time: '15 minutes ago', status: 'completed' },
    { type: 'alert', message: 'Critical damage detected requiring immediate attention', time: '23 minutes ago', status: 'urgent' },
    { type: 'analysis', message: 'Material calculator updated with Q1 2024 pricing', time: '1 hour ago', status: 'completed' }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
            <div className={`p-2 rounded-lg ${
              activity.status === 'urgent' ? 'bg-red-500/20 text-red-400' :
              activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {activity.type === 'analysis' ? <Activity className="w-4 h-4" /> :
               activity.type === 'report' ? <FileText className="w-4 h-4" /> :
               <Zap className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">{activity.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span className="text-slate-500 text-xs">{activity.time}</span>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              activity.status === 'urgent' ? 'bg-red-400' :
              activity.status === 'completed' ? 'bg-green-400' :
              'bg-blue-400'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function AICommandTools() {
  const tools = [
    { name: 'Bulk Analysis', description: 'Process multiple roof images simultaneously', icon: <Activity className="w-5 h-5" />, color: 'bg-blue-500/20 text-blue-400' },
    { name: 'Report Generator', description: 'Create comprehensive assessment reports', icon: <FileText className="w-5 h-5" />, color: 'bg-green-500/20 text-green-400' },
    { name: 'Data Insights', description: 'Extract patterns from historical data', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-purple-500/20 text-purple-400' },
    { name: 'Model Training', description: 'Retrain AI with new roofing data', icon: <Zap className="w-5 h-5" />, color: 'bg-orange-500/20 text-orange-400' }
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">AI Command Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.name}
            className="flex items-center gap-3 p-4 bg-black/20 rounded-xl hover:bg-black/30 transition-all text-left"
          >
            <div className={`p-2 rounded-lg ${tool.color}`}>
              {tool.icon}
            </div>
            <div>
              <h4 className="text-white font-medium">{tool.name}</h4>
              <p className="text-slate-400 text-sm">{tool.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                AI Command <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Dashboard</span>
              </h1>
              <p className="text-slate-300">Internal tools for AI system management and analytics</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Suspense fallback={<div className="bg-white/5 rounded-2xl p-6 animate-pulse" />}>
            <StatCard
              title="Total AI Analyses"
              value={stats.totalAnalyses.toLocaleString()}
              icon={<Activity className="w-6 h-6 text-blue-400" />}
              trend="+12% this week"
              color="bg-blue-500/20"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers.toLocaleString()}
              icon={<Users className="w-6 h-6 text-green-400" />}
              trend="+8% this month"
              color="bg-green-500/20"
            />
            <StatCard
              title="AI Accuracy"
              value={`${stats.averageAccuracy}%`}
              icon={<Zap className="w-6 h-6 text-purple-400" />}
              trend="+0.3% improved"
              color="bg-purple-500/20"
            />
            <StatCard
              title="Reports Generated"
              value={stats.reportsGenerated.toLocaleString()}
              icon={<FileText className="w-6 h-6 text-orange-400" />}
              trend="+15% this week"
              color="bg-orange-500/20"
            />
          </Suspense>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity />
          <AICommandTools />
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">System Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">99.8%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">1.2s</div>
              <div className="text-slate-400 text-sm">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">847GB</div>
              <div className="text-slate-400 text-sm">Data Processed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}