"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, School, Bell, Database, Shield } from "lucide-react"

export default function Settings() {
  const [settings, setSettings] = useState({
    academyName: "The Universal Academy",
    address: "123 Education Street, Knowledge City, State - 123456",
    phone: "+91 9876543210",
    email: "admin@universalacademy.edu",
    website: "www.universalacademy.edu",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    reminderDays: 7,

    // Fee Settings
    lateFeeAmount: 100,
    lateFeeAfterDays: 10,
    discountEnabled: true,

    // System Settings
    autoBackup: true,
    dataRetention: 365,
  })

  const handleSave = () => {
    // Save settings logic here
    console.log("Settings saved:", settings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage academy settings and system configuration</p>
      </div>

      {/* Academy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Academy Information
          </CardTitle>
          <CardDescription>Basic information about your academy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="academyName">Academy Name</Label>
              <Input
                id="academyName"
                value={settings.academyName}
                onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={settings.website}
                onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fee Settings
          </CardTitle>
          <CardDescription>Configure fee collection and penalty settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lateFeeAmount">Late Fee Amount (Rs.)</Label>
              <Input
                id="lateFeeAmount"
                type="number"
                value={settings.lateFeeAmount}
                onChange={(e) => setSettings({ ...settings, lateFeeAmount: Number.parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lateFeeAfterDays">Apply Late Fee After (Days)</Label>
              <Input
                id="lateFeeAfterDays"
                type="number"
                value={settings.lateFeeAfterDays}
                onChange={(e) => setSettings({ ...settings, lateFeeAfterDays: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Discount System</Label>
              <p className="text-sm text-muted-foreground">Allow discounts for early payments or special cases</p>
            </div>
            <Switch
              checked={settings.discountEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, discountEnabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure how and when to send notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send fee reminders and updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Send fee reminders via SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderDays">Send Reminder Before (Days)</Label>
            <Input
              id="reminderDays"
              type="number"
              value={settings.reminderDays}
              onChange={(e) => setSettings({ ...settings, reminderDays: Number.parseInt(e.target.value) })}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>Data backup and system configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataRetention">Data Retention Period (Days)</Label>
            <Input
              id="dataRetention"
              type="number"
              value={settings.dataRetention}
              onChange={(e) => setSettings({ ...settings, dataRetention: Number.parseInt(e.target.value) })}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">How long to keep deleted records in the system</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">System Information</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version:</span>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Backup:</span>
                <span>2024-01-15 10:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Size:</span>
                <span>45.2 MB</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-32">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
