import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Globe, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Mail,
  Activity,
  History,
  Bell,
  FileDown,
  Loader2,
  Brain
} from "lucide-react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function WebsiteDetails() {
  const { id } = useParams<{ id: string }>();
  const websiteId = parseInt(id || "0");
  const [checking, setChecking] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: website, isLoading, refetch } = trpc.websites.get.useQuery({ id: websiteId });
  const { data: checks } = trpc.checks.list.useQuery({ websiteId, limit: 20 });
  const { data: alerts } = trpc.alerts.list.useQuery({ websiteId, limit: 20 });
  const { data: latestCheck } = trpc.checks.latest.useQuery({ websiteId });

  const checkNow = trpc.websites.checkNow.useMutation({
    onSuccess: () => {
      toast.success("تم بدء الفحص", { description: "سيتم تحديث النتائج قريباً" });
      setChecking(false);
      setTimeout(() => refetch(), 5000);
    },
    onError: (error) => {
      toast.error("فشل في بدء الفحص", { description: error.message });
      setChecking(false);
    }
  });

  const handleCheckNow = () => {
    setChecking(true);
    checkNow.mutate({ id: websiteId });
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Fetch the report HTML via API
      const response = await fetch(`/api/trpc/websites.generateReport?input=${encodeURIComponent(JSON.stringify({ id: websiteId }))}`);
      const data = await response.json();
      
      if (!data.result?.data?.html) {
        throw new Error('فشل في إنشاء التقرير');
      }
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(data.result.data.html);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          printWindow.print();
        };
        
        toast.success("تم إنشاء التقرير", { 
          description: "يمكنك طباعته أو حفظه كـ PDF" 
        });
      } else {
        toast.error("فشل في فتح نافذة التقرير", {
          description: "الرجاء السماح بالنوافذ المنبثقة"
        });
      }
    } catch (error) {
      toast.error("فشل في إنشاء التقرير", { 
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع" 
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      healthy: { label: "سليم", className: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
      warning: { label: "تحذير", className: "bg-yellow-100 text-yellow-800", icon: <AlertTriangle className="w-4 h-4" /> },
      critical: { label: "حرج", className: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
      unknown: { label: "غير معروف", className: "bg-gray-100 text-gray-800", icon: <Clock className="w-4 h-4" /> },
    };
    const config = statusConfig[status] || statusConfig.unknown;
    return (
      <Badge className={`${config.className} flex items-center gap-1 text-base px-3 py-1`}>
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

  const getCheckStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      success: { label: "ناجح", className: "bg-green-100 text-green-800" },
      warning: { label: "تحذير", className: "bg-yellow-100 text-yellow-800" },
      error: { label: "خطأ", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.success;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "غير متاح";
    return new Date(date).toLocaleString('ar-SA', { 
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12 text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">الموقع غير موجود</h2>
          <p className="text-muted-foreground mb-4">لم يتم العثور على الموقع المطلوب</p>
          <Link href="/websites">
            <Button>العودة للمواقع</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/websites">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <div className="p-2 rounded-lg bg-primary/10">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold">{website.name || new URL(website.url).hostname}</h1>
                  {getStatusBadge(website.status)}
                </div>
                <a 
                  href={website.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {website.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/websites/${websiteId}/advanced-security`}>
                <Button variant="outline" className="gap-2">
                  <Brain className="w-4 h-4" />
                  تحليل متقدم
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleExportPDF} 
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 ml-2" />
                )}
                تصدير PDF
              </Button>
              <Button onClick={handleCheckNow} disabled={checking}>
                <RefreshCw className={`w-4 h-4 ml-2 ${checking ? 'animate-spin' : ''}`} />
                فحص الآن
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">آخر فحص</p>
                  <p className="font-semibold">{formatDate(website.lastCheckAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">فترة الفحص</p>
                  <p className="font-semibold">كل {website.checkInterval} دقيقة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">إيميل التنبيهات</p>
                  <p className="font-semibold text-sm truncate">{website.notificationEmail}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">عدد التنبيهات</p>
                  <p className="font-semibold">{alerts?.length || 0} تنبيه</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="checks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="checks" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              سجل الفحوصات
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              التنبيهات
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              آخر تحليل
            </TabsTrigger>
          </TabsList>

          {/* Checks Tab */}
          <TabsContent value="checks">
            <Card>
              <CardHeader>
                <CardTitle>سجل الفحوصات</CardTitle>
                <CardDescription>جميع عمليات الفحص التي تمت على الموقع</CardDescription>
              </CardHeader>
              <CardContent>
                {checks && checks.length > 0 ? (
                  <div className="space-y-3">
                    {checks.map((check) => (
                      <div key={check.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          {getCheckStatusBadge(check.status)}
                          <div>
                            <p className="font-medium">{formatDate(check.createdAt)}</p>
                            <p className="text-sm text-muted-foreground">
                              {check.checkType === 'manual' ? 'فحص يدوي' : 'فحص تلقائي'}
                              {check.responseTime && ` • ${check.responseTime}ms`}
                              {check.httpStatus && ` • HTTP ${check.httpStatus}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد فحوصات بعد
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>التنبيهات الأمنية</CardTitle>
                <CardDescription>جميع التنبيهات المكتشفة لهذا الموقع</CardDescription>
              </CardHeader>
              <CardContent>
                {alerts && alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${!alert.isRead ? 'bg-accent/50' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSeverityBadge(alert.severity)}
                              <Badge variant="outline">{alert.type}</Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(alert.createdAt)}</span>
                            </div>
                            <h4 className="font-semibold mb-1">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                          {alert.emailSent && (
                            <Badge variant="outline" className="text-green-600">
                              <Mail className="w-3 h-3 ml-1" />
                              تم الإرسال
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p className="text-muted-foreground">لا توجد تنبيهات</p>
                    <p className="text-sm text-muted-foreground">موقعك آمن حالياً</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>آخر تحليل أمني</CardTitle>
                <CardDescription>نتائج آخر فحص تم إجراؤه بواسطة الذكاء الاصطناعي</CardDescription>
              </CardHeader>
              <CardContent>
                {latestCheck?.aiAnalysis ? (
                  <div className="space-y-4">
                    {(() => {
                      try {
                        const analysis = JSON.parse(latestCheck.aiAnalysis);
                        return (
                          <>
                            <div className="p-4 rounded-lg bg-accent">
                              <h4 className="font-semibold mb-2">ملخص التحليل</h4>
                              <p className="text-sm">{analysis.summary}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="font-medium">مستوى الخطورة العام:</span>
                              {getSeverityBadge(analysis.overallRisk)}
                            </div>

                            {analysis.issues && analysis.issues.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-3">المشاكل المكتشفة ({analysis.issues.length})</h4>
                                <div className="space-y-3">
                                  {analysis.issues.map((issue: any, index: number) => (
                                    <div key={index} className="p-4 rounded-lg border">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getSeverityBadge(issue.severity)}
                                        <span className="font-medium">{issue.title}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                                      <div className="bg-blue-50 p-3 rounded text-sm">
                                        <strong>التوصية:</strong> {issue.recommendation}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      } catch {
                        return <p className="text-muted-foreground">لا يمكن عرض التحليل</p>;
                      }
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لا يوجد تحليل متاح. قم بإجراء فحص للحصول على تحليل جديد.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
