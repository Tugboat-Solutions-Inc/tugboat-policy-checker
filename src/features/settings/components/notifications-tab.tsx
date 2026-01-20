"use client";

import { useEffect, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { AtSign, Megaphone } from "lucide-react";
import { toast } from "@/components/common/toast/toast";
import { updateUser } from "@/features/auth/api/user.actions";
import type {
  User,
  UpdateUserInput,
} from "@/features/auth/schemas/user.schemas";

interface NotificationsTabProps {
  user: User;
  onUserUpdated?: (user: User) => void;
}

export function NotificationsTab({
  user,
  onUserUpdated,
}: NotificationsTabProps) {
  const [notifications, setNotifications] = useState(
    user.settings.notifications
  );
  const [isPending, startTransition] = useTransition();


  useEffect(() => {
    setNotifications(user.settings.notifications);
  }, [user.settings.notifications]);

  const handleToggle = (key: keyof typeof notifications, value: boolean) => {
    const prevNotifications = notifications;
    const nextNotifications = { ...notifications, [key]: value };

    setNotifications(nextNotifications);

    const updatedUser: User = {
      ...user,
      settings: {
        ...user.settings,
        notifications: nextNotifications,
      },
    };

    onUserUpdated?.(updatedUser);

    const payload: UpdateUserInput = {
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      settings: updatedUser.settings,
    };

    startTransition(async () => {
      const result = await updateUser(payload);

      if (!result.success) {
        const rolledBackUser: User = {
          ...user,
          settings: {
            ...user.settings,
            notifications: prevNotifications,
          },
        };

        setNotifications(prevNotifications);
        onUserUpdated?.(rolledBackUser);
        toast.error(result.message);
        return;
      }

      toast.success("Notification settings updated");
    });
  };

  return (
    <div className="p-3 bg-accent border border-accent-border rounded-[8px]">
      <h2 className="text-lg font-semibold mb-1.5">Notifications</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Set your preferences for alerts and reminders.
      </p>

      <div className="flex flex-col gap-6">
        {/* Email */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="bg-background p-3 rounded-[6px] w-10 h-10 border-gray-100 border flex items-center justify-center">
              <AtSign className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-[16px]">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your inventory
              </p>
            </div>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={(checked) => handleToggle("email", checked)}
            disabled={isPending}
          />
        </div>

        {/* Marketing */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="bg-background p-3 rounded-[6px] w-10 h-10 border-gray-100 border flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-[16px]">
                Marketing Communications
              </p>
              <p className="text-sm text-muted-foreground">
                Receive promotional emails and product updates
              </p>
            </div>
          </div>
          <Switch
            checked={notifications.marketing}
            onCheckedChange={(checked) => handleToggle("marketing", checked)}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}
