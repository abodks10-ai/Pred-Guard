import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Bell,
  ArrowRight,
  RefreshCw,
  Mail,
  ExternalLink,
  CheckCircle,
  Filter
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Alerts() {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data: alerts, isLoading, refetch } = trpc.alerts.list.useQuery({ limit: 100 });
  const { data: unreadCount } = trpc.alerts.unreadCount.useQuery();
  const utils = trpc.useUtils();

  const markAsRead = trpc.alerts.markAsRead.useMutation({
    onSuccess: () => {
      utils.alerts.list.invalidate();
      utils.alerts.unreadCount.invalidate();
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      vulnerability: "ثغرة أمنية",
      intrusion_attempt: "محاولة اختراق",
      anomaly: "نشاط شاذ",
      downtime: "توقف الموقع",
      content_change: "تغيير محتوى",
      ssl_issue: "مشكلة SSL",
      performance: "مشكلة أداء",
      other: "أخرى",
    };
    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
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

  const filteredAlerts = alerts?.filter(alert => {
    if (severityFilter === "all") return true;
    return alert.severity === severityFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Bell className="w-8 h-8 text-primary" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold">التنبيهات الأمنية</h1>
                  {unreadCount && unreadCount > 0 && (
                    <Badge className="bg-red-500">{unreadCount} غير مقروء</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">جميع التنبيهات المكتشفة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="تصفية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="critical">حرجة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                تحديث
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">جاري تحميل التنبيهات...</p>
          </div>
        ) : filteredAlerts && filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`${!alert.isRead ? 'border-primary/50 bg-accent/30' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        {getSeverityBadge(alert.severity)}
                        {getTypeBadge(alert.type)}
                        {!alert.isRead && (
                          <Badge className="bg-blue-500">جديد</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">{formatDate(alert.createdAt)}</span>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2">{alert.title}</h3>
                      <p className="text-muted-foreground mb-3">{alert.description}</p>
                      
                      {'websiteUrl' in alert && (
                        <a 
                          href={alert.websiteUrl as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 mb-3"
                        >
                          {alert.websiteUrl as string}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {alert.details && (
                        <div className="bg-muted p-4 rounded-lg text-sm">
                          {(() => {
                            try {
                              const details = JSON.parse(alert.details);
                              return (
                                <div className="space-y-2">
                                  {details.technicalDetails && (
                                    <div>
                                      <strong>التفاصيل التقنية:</strong>
                                      <p className="text-muted-foreground">{details.technicalDetails}</p>
                                    </div>
                                  )}
                                  {details.recommendation && (
                                    <div className="bg-blue-50 p-3 rounded mt-2">
                                      <strong>التوصية:</strong>
                                      <p>{details.recommendation}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch {
                              return <p>{alert.details}</p>;
                            }
                          })()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {alert.emailSent && (
                        <Badge variant="outline" className="text-green-600">
                          <Mail className="w-3 h-3 ml-1" />
                          تم إرسال إشعار
                        </Badge>
                      )}
                      {!alert.isRead && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead.mutate({ id: alert.id })}
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          تحديد كمقروء
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد تنبيهات</h3>
              <p className="text-muted-foreground">
                {severityFilter !== "all" 
                  ? "لا توجد تنبيهات بهذا المستوى من الخطورة"
                  : "مواقعك آمنة حالياً ولا توجد تنبيهات"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
