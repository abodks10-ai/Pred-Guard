import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Shield, AlertTriangle, Target, Eye, Bug, Link2, 
  Users, TrendingUp, Loader2, ArrowRight, ChevronLeft,
  Brain, Radar, FileWarning, Globe, BarChart3
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AdvancedSecurity() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const websiteId = parseInt(params.id || "0");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: website, isLoading: websiteLoading } = trpc.websites.get.useQuery(
    { id: websiteId },
    { enabled: !!websiteId && !!user }
  );

  const fullAnalysisMutation = trpc.advancedSecurity.fullAnalysis.useMutation({
    onSuccess: (data) => {
      setAnalysisResult(data);
      setIsAnalyzing(false);
      toast.success("تم إكمال التحليل الأمني المتقدم");
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error("حدث خطأ أثناء التحليل: " + error.message);
    }
  });

  const handleFullAnalysis = () => {
    setIsAnalyzing(true);
    fullAnalysisMutation.mutate({ websiteId });
  };

  if (authLoading || websiteLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!website) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">الموقع غير موجود</p>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: "بصمة السلوك الأمني",
      description: "تعلم الأنماط الطبيعية واكتشاف الانحرافات",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Radar,
      title: "التنبؤ بالهجمات العالمية",
      description: "تحليل اتجاهات الهجمات وتوقع التهديدات",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Bug,
      title: "كشف نقاط الضعف",
      description: "تحليل الكود واكتشاف الثغرات المحتملة",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Link2,
      title: "كشف الروابط الخبيثة",
      description: "فحص جميع الروابط واكتشاف التهديدات",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Users,
      title: "تحليل سلوك الزوار",
      description: "التفريق بين الزوار الحقيقيين والمهاجمين",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Globe,
      title: "كشف مواقع الانتحال",
      description: "اكتشاف المواقع التي تحاول تقليد موقعك",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      icon: BarChart3,
      title: "مقارنة مستوى الحماية",
      description: "قارن أمان موقعك بمتوسط الصناعة",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      icon: Shield,
      title: "الدفاع التلقائي",
      description: "إجراءات فورية للحد من الهجمات",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLocation(`/websites/${websiteId}`)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  التحليل الأمني المتقدم
                </h1>
                <p className="text-sm text-muted-foreground">{website.name || website.url}</p>
              </div>
            </div>
            <Button 
              onClick={handleFullAnalysis}
              disabled={isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  بدء التحليل الشامل
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="vulnerabilities">الثغرات</TabsTrigger>
              <TabsTrigger value="predictions">التوقعات</TabsTrigger>
              <TabsTrigger value="links">الروابط</TabsTrigger>
              <TabsTrigger value="benchmark">المقارنة</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Security Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">درجة الأمان</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">
                        {analysisResult.securityBenchmark?.overallScore || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">من 100</p>
                      <Progress 
                        value={analysisResult.securityBenchmark?.overallScore || 0} 
                        className="mt-4"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Behavior Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">تحليل السلوك</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">درجة الانحراف</span>
                        <Badge variant={
                          analysisResult.behaviorAnalysis?.deviationScore > 50 ? "destructive" :
                          analysisResult.behaviorAnalysis?.deviationScore > 25 ? "secondary" : "default"
                        }>
                          {analysisResult.behaviorAnalysis?.deviationScore || 0}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">حالة الانحراف</span>
                        <Badge variant={analysisResult.behaviorAnalysis?.isAnomaly ? "destructive" : "default"}>
                          {analysisResult.behaviorAnalysis?.isAnomaly ? "مكتشف" : "طبيعي"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الثغرات المكتشفة</span>
                        <Badge variant="destructive">
                          {analysisResult.codeVulnerabilities?.vulnerabilities?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">الروابط المشبوهة</span>
                        <Badge variant="secondary">
                          {analysisResult.maliciousLinks?.maliciousLinks?.length || 0}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">التوقعات النشطة</span>
                        <Badge>
                          {analysisResult.attackPredictions?.predictions?.length || 0}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="vulnerabilities">
              <Card>
                <CardHeader>
                  <CardTitle>الثغرات المكتشفة</CardTitle>
                  <CardDescription>نقاط الضعف في الكود والتكوين</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.codeVulnerabilities?.vulnerabilities?.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.codeVulnerabilities.vulnerabilities.map((vuln: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bug className="h-5 w-5 text-red-500" />
                              <span className="font-semibold">{vuln.type}</span>
                            </div>
                            <Badge variant={
                              vuln.severity === 'critical' ? 'destructive' :
                              vuln.severity === 'high' ? 'destructive' :
                              vuln.severity === 'medium' ? 'secondary' : 'default'
                            }>
                              {vuln.severity === 'critical' ? 'حرج' :
                               vuln.severity === 'high' ? 'عالي' :
                               vuln.severity === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                          <div className="bg-muted/50 rounded p-2 text-xs">
                            <strong>التوصية:</strong> {vuln.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لم يتم اكتشاف ثغرات</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictions">
              <Card>
                <CardHeader>
                  <CardTitle>توقعات الهجمات</CardTitle>
                  <CardDescription>التهديدات المتوقعة بناءً على الاتجاهات العالمية</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.attackPredictions?.predictions?.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.attackPredictions.predictions.map((pred: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Target className="h-5 w-5 text-orange-500" />
                              <span className="font-semibold">{pred.attackType}</span>
                            </div>
                            <Badge variant={pred.probability > 70 ? 'destructive' : pred.probability > 40 ? 'secondary' : 'default'}>
                              احتمالية {pred.probability}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            الإطار الزمني: {pred.timeframe}
                          </p>
                          {pred.preventiveMeasures && (
                            <div className="bg-muted/50 rounded p-2 text-xs">
                              <strong>إجراءات وقائية:</strong>
                              <ul className="list-disc list-inside mt-1">
                                {pred.preventiveMeasures.map((measure: string, i: number) => (
                                  <li key={i}>{measure}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Radar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد توقعات حالياً</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links">
              <Card>
                <CardHeader>
                  <CardTitle>الروابط المشبوهة</CardTitle>
                  <CardDescription>الروابط الخبيثة المكتشفة في الموقع</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.maliciousLinks?.maliciousLinks?.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.maliciousLinks.maliciousLinks.map((link: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Link2 className="h-5 w-5 text-red-500" />
                              <span className="font-mono text-sm break-all">{link.url}</span>
                            </div>
                            <Badge variant="destructive">{link.threatType}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            موجود في: {link.foundIn}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لم يتم اكتشاف روابط مشبوهة</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmark">
              <Card>
                <CardHeader>
                  <CardTitle>مقارنة مستوى الحماية</CardTitle>
                  <CardDescription>مقارنة أمان موقعك بمتوسط الصناعة</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.securityBenchmark ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-3xl font-bold text-primary">
                            {analysisResult.securityBenchmark.overallScore}
                          </div>
                          <p className="text-sm text-muted-foreground">درجتك</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-3xl font-bold">
                            {analysisResult.securityBenchmark.industryAverage}
                          </div>
                          <p className="text-sm text-muted-foreground">متوسط الصناعة</p>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-3xl font-bold text-green-500">
                            {analysisResult.securityBenchmark.percentileRank}%
                          </div>
                          <p className="text-sm text-muted-foreground">ترتيبك</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            نقاط القوة
                          </h4>
                          <ul className="space-y-2">
                            {analysisResult.securityBenchmark.strengths?.map((s: string, i: number) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            نقاط الضعف
                          </h4>
                          <ul className="space-y-2">
                            {analysisResult.securityBenchmark.weaknesses?.map((w: string, i: number) => (
                              <li key={i} className="text-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {analysisResult.securityBenchmark.recommendations?.length > 0 && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-semibold mb-3">التوصيات</h4>
                          <ul className="space-y-2">
                            {analysisResult.securityBenchmark.recommendations.map((r: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد بيانات مقارنة</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Empty State */}
        {!analysisResult && !isAnalyzing && (
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
              <h3 className="text-xl font-semibold mb-2">ابدأ التحليل الأمني المتقدم</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                استخدم الذكاء الاصطناعي لتحليل موقعك بشكل شامل واكتشاف الثغرات والتهديدات المحتملة
              </p>
              <Button onClick={handleFullAnalysis} size="lg" className="gap-2">
                <Brain className="h-5 w-5" />
                بدء التحليل الشامل
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
              <h3 className="text-xl font-semibold mb-2">جاري التحليل...</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                يقوم الذكاء الاصطناعي بتحليل موقعك. قد يستغرق هذا بضع دقائق.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
