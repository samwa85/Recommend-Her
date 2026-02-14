// ============================================================================
// SETTINGS PAGE - Admin settings and configuration
// ============================================================================

import { useState } from 'react';
import {
  Settings,
  Bell,
  Shield,
  Users,
  Database,
  Mail,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { AdminLayout } from '../components/AdminLayout';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewTalent: true,
    emailNewSponsor: true,
    emailNewMessage: true,
    emailDailyDigest: false,
    browserNotifications: true,
    slackIntegration: false,
  });

  // Approval settings
  const [approvals, setApprovals] = useState({
    autoApproveTalent: false,
    autoApproveSponsors: false,
    requireCvForTalent: true,
    notifyOnApproval: true,
  });

  // Display settings
  const [display, setDisplay] = useState({
    itemsPerPage: '25',
    defaultTalentStatus: 'all',
    defaultSponsorStatus: 'all',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    senderName: 'Recommend Her Admin',
    senderEmail: 'admin@recommendher.com',
    replyToEmail: 'support@recommendher.com',
    emailFooter: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  const updateNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const updateApproval = (key: string, value: boolean) => {
    setApprovals(prev => ({ ...prev, [key]: value }));
  };

  const updateDisplay = (key: string, value: string) => {
    setDisplay(prev => ({ ...prev, [key]: value }));
  };

  const updateEmail = (key: string, value: string) => {
    setEmailSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Manage admin dashboard configuration"
      actions={
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      }
    >
      <div className="space-y-6 max-w-4xl">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure when and how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New talent submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when new talent profiles are submitted
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNewTalent}
                  onCheckedChange={(v) => updateNotification('emailNewTalent', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New sponsor registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email when new sponsors register
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNewSponsor}
                  onCheckedChange={(v) => updateNotification('emailNewSponsor', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New contact messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email for new contact form submissions
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNewMessage}
                  onCheckedChange={(v) => updateNotification('emailNewMessage', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of all activity
                  </p>
                </div>
                <Switch
                  checked={notifications.emailDailyDigest}
                  onCheckedChange={(v) => updateNotification('emailDailyDigest', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show desktop notifications for important events
                  </p>
                </div>
                <Switch
                  checked={notifications.browserNotifications}
                  onCheckedChange={(v) => updateNotification('browserNotifications', v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approval Workflow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Approval Workflow
            </CardTitle>
            <CardDescription>
              Configure how talent and sponsor submissions are processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve talent</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve talent submissions (not recommended)
                  </p>
                </div>
                <Switch
                  checked={approvals.autoApproveTalent}
                  onCheckedChange={(v) => updateApproval('autoApproveTalent', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve sponsors</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve sponsor registrations
                  </p>
                </div>
                <Switch
                  checked={approvals.autoApproveSponsors}
                  onCheckedChange={(v) => updateApproval('autoApproveSponsors', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require CV for talent</Label>
                  <p className="text-sm text-muted-foreground">
                    Talent submissions must include a CV
                  </p>
                </div>
                <Switch
                  checked={approvals.requireCvForTalent}
                  onCheckedChange={(v) => updateApproval('requireCvForTalent', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notify on approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notification when profiles are approved
                  </p>
                </div>
                <Switch
                  checked={approvals.notifyOnApproval}
                  onCheckedChange={(v) => updateApproval('notifyOnApproval', v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              Display Settings
            </CardTitle>
            <CardDescription>
              Customize how data is displayed in the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemsPerPage">Items per page</Label>
                <Select
                  value={display.itemsPerPage}
                  onValueChange={(v) => updateDisplay('itemsPerPage', v)}
                >
                  <SelectTrigger id="itemsPerPage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={display.timezone}
                  onValueChange={(v) => updateDisplay('timezone', v)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date format</Label>
                <Select
                  value={display.dateFormat}
                  onValueChange={(v) => updateDisplay('dateFormat', v)}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email Settings
            </CardTitle>
            <CardDescription>
              Configure email sender information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  value={emailSettings.senderName}
                  onChange={(e) => updateEmail('senderName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={emailSettings.senderEmail}
                  onChange={(e) => updateEmail('senderEmail', e.target.value)}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="replyToEmail">Reply-To Email</Label>
                <Input
                  id="replyToEmail"
                  type="email"
                  value={emailSettings.replyToEmail}
                  onChange={(e) => updateEmail('replyToEmail', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export and manage your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">Export All Talent</Button>
              <Button variant="outline">Export All Sponsors</Button>
              <Button variant="outline">Export Messages</Button>
              <Button variant="destructive" className="ml-auto">
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
