import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowRight, Globe, Mail, Clock, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AddWebsite() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [checkInterval, setCheckInterval] = useState("10");

  const createWebsite = trpc.websites.create.useMutation({
    onSuccess: (website) => {
      toast.success("تم إضافة الموقع بنجاح", {
        description: "سيبدأ النظام بمراقبة موقعك فوراً"
      });
      setLocation(`/websites/${website.id}`);
    },
    onError: (error) => {
      toast.error("فشل في إضافة الموقع", {
        description: error.message
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error("الرجاء إدخال رابط الموقع");
      return;
    }
    
    if (!email) {
      toast.error("الرجاء إدخال البريد الإلكتروني للتنبيهات");
      return;
    }

    createWebsite.mutate({
      url: url.startsWith("http") ? url : `https://${url}`,
      name: name || undefined,
      notificationEmail: email,
      checkInterval: parseInt(checkInterval),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">إضافة موقع جديد</h1>
              <p className="text-sm text-muted-foreground">أضف موقعك للمراقبة الأمنية</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الموقع</CardTitle>
              <CardDescription>
                أدخل معلومات الموقع الذي تريد مراقبته. سيقوم النظام بفحص الموقع بشكل دوري
                وإرسال تنبيهات عند اكتشاف أي نشاط مريب.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* URL Field */}
                <div className="space-y-2">
                  <Label htmlFor="url" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    رابط الموقع *
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="text-left"
                    dir="ltr"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل الرابط الكامل للموقع بما في ذلك https://
                  </p>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الموقع (اختياري)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="موقعي الرئيسي"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    اسم مميز للموقع لتسهيل التعرف عليه
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني للتنبيهات *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="alerts@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-left"
                    dir="ltr"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    سيتم إرسال التنبيهات الأمنية إلى هذا البريد
                  </p>
                </div>

                {/* Check Interval */}
                <div className="space-y-2">
                  <Label htmlFor="interval" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    فترة الفحص
                  </Label>
                  <Select value={checkInterval} onValueChange={setCheckInterval}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فترة الفحص" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">كل 5 دقائق</SelectItem>
                      <SelectItem value="10">كل 10 دقائق</SelectItem>
                      <SelectItem value="15">كل 15 دقيقة</SelectItem>
                      <SelectItem value="30">كل 30 دقيقة</SelectItem>
                      <SelectItem value="60">كل ساعة</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    كم مرة يجب فحص الموقع للكشف عن التهديدات
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">ماذا سيحدث بعد الإضافة؟</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• سيتم فحص موقعك فوراً للتحقق من حالته</li>
                    <li>• سيبدأ النظام بالمراقبة الدورية حسب الفترة المحددة</li>
                    <li>• ستتلقى تنبيهات فورية عند اكتشاف أي تهديد</li>
                    <li>• يمكنك مراجعة سجل الفحوصات والتنبيهات في أي وقت</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createWebsite.isPending}
                  >
                    {createWebsite.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الإضافة...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 ml-2" />
                        إضافة الموقع وبدء المراقبة
                      </>
                    )}
                  </Button>
                  <Link href="/">
                    <Button type="button" variant="outline">إلغاء</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
