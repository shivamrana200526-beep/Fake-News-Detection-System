import { useStats, useHistory } from "@/hooks/use-analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { format } from "date-fns";
import { Activity, ShieldAlert, ShieldCheck, Target, Loader2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (<div className="bg-card border border-border rounded-xl shadow-xl p-3 text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (<p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>))}
      </div>);
    }
    return null;
};
export default function Dashboard() {
    const { data: stats, isLoading: statsLoading } = useStats();
    const { data: history, isLoading: historyLoading } = useHistory();
    if (statsLoading || historyLoading) {
        return (<div className="container mx-auto max-w-7xl px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="satya-gradient p-4 rounded-2xl mb-6 shadow-xl shadow-primary/20">
          <Loader2 className="h-10 w-10 text-white animate-spin"/>
        </div>
        <h2 className="text-2xl font-bold text-primary">Compiling Global Data...</h2>
        <p className="text-muted-foreground mt-2">Aggregating real-time analysis results</p>
      </div>);
    }
    if (!stats || !history)
        return null;
    const pieData = [
        { name: 'Real', value: stats.realCount },
        { name: 'Fake', value: stats.fakeCount },
        { name: 'Misleading', value: stats.misleadingCount },
    ];
    const accuracy = stats.total > 0 ? Math.round(((stats.realCount + stats.fakeCount + stats.misleadingCount) / stats.total) * 100) : 0;
    const kpis = [
        {
            label: "Total Analyzed",
            value: stats.total,
            icon: <Activity className="h-5 w-5"/>,
            color: "text-primary",
            bg: "bg-primary/10",
            delay: 0.1
        },
        {
            label: "Verified Real",
            value: stats.realCount,
            icon: <ShieldCheck className="h-5 w-5"/>,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            delay: 0.2
        },
        {
            label: "Detected Fake",
            value: stats.fakeCount,
            icon: <ShieldAlert className="h-5 w-5"/>,
            color: "text-destructive",
            bg: "bg-destructive/10",
            delay: 0.3
        },
        {
            label: "Misleading",
            value: stats.misleadingCount,
            icon: <Target className="h-5 w-5"/>,
            color: "text-warning",
            bg: "bg-warning/10",
            delay: 0.4
        },
    ];
    return (<div className="container mx-auto max-w-7xl px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary"/>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Live Analytics</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Global Dashboard</h1>
          <p className="text-muted-foreground mt-2">Real-time statistics on fact-checking activities across SatyaCheck.</p>
        </div>
        {stats.total > 0 && (<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
            {stats.total} analyses recorded
          </div>)}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: kpi.delay }}>
            <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                  <h3 className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</h3>
                </div>
                <div className={`p-3 ${kpi.bg} ${kpi.color} rounded-xl`}>{kpi.icon}</div>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md border-border/50">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg font-bold text-foreground">Analysis Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            {stats.total === 0 ? (<div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data yet — start analyzing!</div>) : (<ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent"/>))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />}/>
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }}/>
                </PieChart>
              </ResponsiveContainer>)}
          </CardContent>
        </Card>

        <Card className="shadow-md border-border/50">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg font-bold text-foreground">Trending Keywords</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-[300px]">
            {!stats.trendingTopics || stats.trendingTopics.length === 0 ? (<div className="h-full flex items-center justify-center text-muted-foreground text-sm">Trending keywords will appear after analyses.</div>) : (<ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.trendingTopics} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))"/>
                  <XAxis type="number" hide/>
                  <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} width={90} style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}/>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }}/>
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {(stats.trendingTopics ?? []).map((_, index) => (<Cell key={`cell-${index}`} fill={`hsl(${245 + index * 15} 58% 55%)`}/>))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>)}
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="shadow-md border-border/50 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50">
          <CardTitle className="text-lg font-bold text-foreground">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableHead className="w-[110px] font-semibold">Date</TableHead>
                  <TableHead className="w-[100px] font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Content Snapshot</TableHead>
                  <TableHead className="font-semibold">Verdict</TableHead>
                  <TableHead className="text-right font-semibold">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (<TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {item.createdAt ? format(new Date(item.createdAt), "MMM d, HH:mm") : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold">{item.sourceType}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate font-medium text-sm">
                      {item.content.length > 65 ? item.content.substring(0, 65) + "…" : item.content}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("pointer-events-none font-semibold", item.prediction.toLowerCase() === 'real'
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                : item.prediction.toLowerCase() === 'fake'
                    ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-900"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900")}>
                        {item.prediction}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-sm">
                      {item.confidence}%
                    </TableCell>
                  </TableRow>))}
                {history.length === 0 && (<TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <Activity className="h-8 w-8 text-muted-foreground/30"/>
                        <span>No analyses recorded yet. Go to Detect to start!</span>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>);
}
