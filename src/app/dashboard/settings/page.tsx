import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SettingsIcon, UserIcon, BellIcon, ShieldIcon } from 'lucide-react';

/**
 * Settings Page - Placeholder
 */
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>
              Manage your account information and profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your experience and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Security & Privacy</CardTitle>
            </div>
            <CardDescription>
              Manage your security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

