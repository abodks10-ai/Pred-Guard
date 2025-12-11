import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Globe, 
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  MoreVertical,
  Trash2,
  RefreshCw,
  Settings,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

export default function Websites() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [checkingId, setCheckingId] = useState<number | null>(null);

  const { data: websites, isLoading, refetch } = trpc.websites.list.useQuery();
  const utils = trpc.useUtils();

  const deleteWebsite = trpc.websites.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الموقع بنجاح");
      utils.websites.list.invalidate();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error("فشل في حذف الموقع", { description: error.message });
    }
  });

  const checkNow = trpc.websites.checkNow.useMutation({
    onSuccess: () => {
      toast.success("تم بدء الفحص", { description: "سيتم تحديث النتائج قريباً" });
      setCheckingId(null);
      setTimeout(() => refetch(), 5000);
    },
    onError: (error) => {
      toast.error("فشل في بدء الفحص", { description: error.message });
      setCheckingId(null);
    }
  });

  const handleCheckNow = (id: number) => {
    setCheckingId(id);
    checkNow.mutate({ id });
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

  const formatDate = (date: Date | null) => {
    if (!date) return "لم يتم الفحص بعد";
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
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">المواقع المراقبة</h1>
                <p className="text-sm text-muted-foreground">إدارة جميع مواقعك</p>
              </div>
            </div>
            <Link href="/websites/add">
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                إضافة موقع
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">جاري تحميل المواقع...</p>
          </div>
        ) : websites && websites.length > 0 ? (
          <div className="grid gap-4">
            {websites.map((website) => (
              <Card key={website.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Link href={`/websites/${website.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                              {website.name || new URL(website.url).hostname}
                            </h3>
                          </Link>
                          {getStatusBadge(website.status)}
                          {!website.isActive && (
                            <Badge variant="outline" className="text-gray-500">متوقف</Badge>
                          )}
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
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>آخر فحص: {formatDate(website.lastCheckAt)}</span>
                          <span>•</span>
                          <span>فترة الفحص: كل {website.checkInterval} دقيقة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCheckNow(website.id)}
                        disabled={checkingId === website.id}
                      >
                        <RefreshCw className={`w-4 h-4 ml-1 ${checkingId === website.id ? 'animate-spin' : ''}`} />
                        فحص الآن
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/websites/${website.id}`}>
                            <DropdownMenuItem>
                              <Settings className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteId(website.id)}
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف الموقع
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Globe className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد مواقع مسجلة</h3>
              <p className="text-muted-foreground mb-6">
                أضف موقعك الأول لبدء المراقبة الأمنية
              </p>
              <Link href="/websites/add">
                <Button>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة موقع جديد
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الموقع؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الموقع وجميع سجلات الفحص والتنبيهات المرتبطة به. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteWebsite.mutate({ id: deleteId })}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
