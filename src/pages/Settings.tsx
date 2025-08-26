import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings as SettingsIcon,
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Loader2
} from "lucide-react";

interface BusinessProfile {
  business_name: string;
  business_type: string;
  business_description: string;
  target_audience: string;
  business_tone: string;
  special_instructions: string;
}

interface UserSettings {
  notifications: {
    email: boolean;
    browser: boolean;
    reviews: boolean;
    responses: boolean;
  };
  privacy: {
    profileVisibility: boolean;
    dataSharing: boolean;
  };
  preferences: {
    language: string;
    timezone: string;
    theme: string;
  };
}

export function Settings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    business_name: "",
    business_type: "",
    business_description: "",
    target_audience: "",
    business_tone: "professional",
    special_instructions: ""
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      browser: true,
      reviews: true,
      responses: true
    },
    privacy: {
      profileVisibility: true,
      dataSharing: false
    },
    preferences: {
      language: "he",
      timezone: "Asia/Jerusalem",
      theme: "system"
    }
  });

  useEffect(() => {
    fetchBusinessProfile();
    fetchUserSettings();
  }, []);

  const fetchBusinessProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching business profile:', error);
        return;
      }

      if (data) {
        setBusinessProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettings = async () => {
    // In a real app, fetch user settings from database
    // For now, use default values
  };

  const saveBusinessProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: t("common.error"),
          description: "User not authenticated",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('business_profiles')
        .upsert({
          user_id: user.id,
          ...businessProfile
        });

      if (error) {
        console.error('Error saving business profile:', error);
        toast({
          title: t("common.error"),
          description: "Failed to save business profile",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("settings.profileSaved"),
        description: "Business profile updated successfully",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t("common.error"),
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveUserSettings = async () => {
    setSaving(true);
    try {
      // In a real app, save to database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: t("settings.settingsSaved"),
        description: "Settings updated successfully",
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{t("sidebar.settings")}</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t("sidebar.settings")}</h1>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {t("settings.businessProfile")}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            {t("settings.notifications")}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t("settings.privacy")}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t("settings.preferences")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t("settings.businessProfile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">{t("settings.businessName")}</Label>
                  <Input
                    id="businessName"
                    value={businessProfile.business_name}
                    onChange={(e) => setBusinessProfile({
                      ...businessProfile,
                      business_name: e.target.value
                    })}
                    placeholder={t("settings.enterBusinessName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">{t("settings.businessType")}</Label>
                  <Select
                    value={businessProfile.business_type}
                    onValueChange={(value) => setBusinessProfile({
                      ...businessProfile,
                      business_type: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("settings.selectBusinessType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">{t("settings.restaurant")}</SelectItem>
                      <SelectItem value="retail">{t("settings.retail")}</SelectItem>
                      <SelectItem value="service">{t("settings.service")}</SelectItem>
                      <SelectItem value="healthcare">{t("settings.healthcare")}</SelectItem>
                      <SelectItem value="hospitality">{t("settings.hospitality")}</SelectItem>
                      <SelectItem value="other">{t("settings.other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">{t("settings.businessDescription")}</Label>
                <Textarea
                  id="businessDescription"
                  value={businessProfile.business_description}
                  onChange={(e) => setBusinessProfile({
                    ...businessProfile,
                    business_description: e.target.value
                  })}
                  placeholder={t("settings.describeYourBusiness")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">{t("settings.targetAudience")}</Label>
                <Input
                  id="targetAudience"
                  value={businessProfile.target_audience}
                  onChange={(e) => setBusinessProfile({
                    ...businessProfile,
                    target_audience: e.target.value
                  })}
                  placeholder={t("settings.describeTargetAudience")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessTone">{t("settings.businessTone")}</Label>
                <Select
                  value={businessProfile.business_tone}
                  onValueChange={(value) => setBusinessProfile({
                    ...businessProfile,
                    business_tone: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">{t("settings.professional")}</SelectItem>
                    <SelectItem value="friendly">{t("settings.friendly")}</SelectItem>
                    <SelectItem value="casual">{t("settings.casual")}</SelectItem>
                    <SelectItem value="formal">{t("settings.formal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">{t("settings.specialInstructions")}</Label>
                <Textarea
                  id="specialInstructions"
                  value={businessProfile.special_instructions}
                  onChange={(e) => setBusinessProfile({
                    ...businessProfile,
                    special_instructions: e.target.value
                  })}
                  placeholder={t("settings.specialInstructionsPlaceholder")}
                  rows={3}
                />
              </div>

              <Button onClick={saveBusinessProfile} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("settings.notificationSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.emailNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.emailNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.email}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings,
                    notifications: { ...userSettings.notifications, email: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.browserNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.browserNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.browser}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings,
                    notifications: { ...userSettings.notifications, browser: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.reviewNotifications")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.reviewNotificationsDesc")}
                  </p>
                </div>
                <Switch
                  checked={userSettings.notifications.reviews}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings,
                    notifications: { ...userSettings.notifications, reviews: checked }
                  })}
                />
              </div>

              <Button onClick={saveUserSettings} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t("settings.privacySettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.profileVisibility")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.profileVisibilityDesc")}
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.profileVisibility}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings,
                    privacy: { ...userSettings.privacy, profileVisibility: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.dataSharing")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.dataSharingDesc")}
                  </p>
                </div>
                <Switch
                  checked={userSettings.privacy.dataSharing}
                  onCheckedChange={(checked) => setUserSettings({
                    ...userSettings,
                    privacy: { ...userSettings.privacy, dataSharing: checked }
                  })}
                />
              </div>

              <Button onClick={saveUserSettings} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t("settings.userPreferences")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("settings.language")}</Label>
                  <Select
                    value={userSettings.preferences.language}
                    onValueChange={(value) => setUserSettings({
                      ...userSettings,
                      preferences: { ...userSettings.preferences, language: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="he">עברית</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("settings.timezone")}</Label>
                  <Select
                    value={userSettings.preferences.timezone}
                    onValueChange={(value) => setUserSettings({
                      ...userSettings,
                      preferences: { ...userSettings.preferences, timezone: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Jerusalem">Jerusalem (GMT+2)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("settings.theme")}</Label>
                <Select
                  value={userSettings.preferences.theme}
                  onValueChange={(value) => setUserSettings({
                    ...userSettings,
                    preferences: { ...userSettings.preferences, theme: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("settings.lightTheme")}</SelectItem>
                    <SelectItem value="dark">{t("settings.darkTheme")}</SelectItem>
                    <SelectItem value="system">{t("settings.systemTheme")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={saveUserSettings} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("common.save")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}