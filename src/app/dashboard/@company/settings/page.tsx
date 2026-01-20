import { ROUTES } from "@/config/routes";
import { USER_TYPES } from "@/constants/user-types";
import { getUser } from "@/features/auth/api/user.actions";
import { SettingsTabs } from "@/features/settings/components/settings-tabs";
import { redirect } from "next/navigation";

export default async function CompanySettingsPage() {
  const result = await getUser();
  if (!result.success) {
    redirect(ROUTES.HOME);
  }

  return (
    <div className="overflow-x-hidden">
      <div className="mx-6 mt-5">
        <SettingsTabs accountType={USER_TYPES.COMPANY} user={result.data} />
      </div>
    </div>
  );
}
