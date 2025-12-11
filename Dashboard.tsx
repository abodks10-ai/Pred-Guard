import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Globe, 
  AlertTriangle, 
  Bell, 
  Plus,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.dashboard.stats.useQuery();
  const { data: websites, isLoading: websitesLoading, refetch: refetchWebsites } = trpc.websites.list.useQuery();
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = trpc.alerts.list.useQuery({ limit: 5 });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchWebsites(), refetchAlerts()]);
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      healthy: { label: "سليم", className: "bg-green-100 text-green-800", icon: <CheckCircle className="w-3 h-3" /> },
      warning: { label: "تحذير", className: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-3 h-3" /> },
      critical: { label: "حرج", className: "bg-red-100 text-red-800", icon: <XCircle className="w-3 h-3" /> },
      unknown: { label: "غير معروف", className: "bg-gray-100 text-gray-800", icon: <Clock className="w-3 h-3" /> },
    };
    const config = statusConfig[status] || statusConfig.unknown;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<string, { label: string; className: string }> = {
      low: { label: "منخفضة", className: "bg-blue-100 text-blue-800" },
      medium: { label: "متوسطة", className: "bg-yellow-100 text-yellow-800" },
      high: { label: "عالية", className: "bg-orange-100 text-orange-800" },
      critical: { label: "حرجة", className: "bg-red-100 text-red-800" },
    };
    const config = severityConfig[severity] || severityConfig.low;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ar-SA', { 
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">PredGuard</h1>
                <p className="text-sm text-muted-foreground">مرحباً، {user?.name || 'مستخدم'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
              <Link href="/websites/add">
                <Button size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة موقع
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المواقع</CardTitle>
              <Globe className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalWebsites || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeWebsites || 0} موقع نشط
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التنبيهات</CardTitle>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsLoading ? '...' : stats?.totalAlerts || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.unreadAlerts || 0} غير مقروء
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">تنبيهات حرجة</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statsLoading ? '...' : stats?.criticalAlerts || 0}</div>
              <p className="text-xs text-muted-foreground">تحتاج اهتمام فوري</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">حالة النظام</CardTitle>
              <Activity className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">نشط</div>
              <p className="text-xs text-muted-foreground">المراقبة تعمل 24/7</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Websites List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>المواقع المراقبة</CardTitle>
                  <CardDescription>قائمة بجميع المواقع تحت المراقبة</CardDescription>
                </div>
                <Link href="/websites">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {websitesLoading ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : websites && websites.length > 0 ? (
                <div className="space-y-3">
                  {websites.slice(0, 5).map((website) => (
                    <Link key={website.id} href={`/websites/${website.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{website.name || new URL(website.url).hostname}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{website.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(website.status)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">لا توجد مواقع مسجلة</p>
                  <Link href="/websites/add">
                    <Button>
                      <Plus className="w-4 h-4 ml-2" />
                      أضف موقعك الأول
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>آخر التنبيهات</CardTitle>
                  <CardDescription>التنبيهات الأمنية الأخيرة</CardDescription>
                </div>
                <Link href="/alerts">
                  <Button variant="ghost" size="sm">عرض الكل</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : alerts && alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${!alert.isRead ? 'bg-accent/50' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityBadge(alert.severity)}
                            <span className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</span>
                          </div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="text-muted-foreground">لا توجد تنبيهات</p>
                  <p className="text-sm text-muted-foreground">مواقعك آمنة حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
