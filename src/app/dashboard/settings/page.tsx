import { db } from "@/db";
import { settings } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const [userSettings] = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, userId))
    .limit(1);

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <SettingsForm settings={userSettings} />
    </div>
  );
}