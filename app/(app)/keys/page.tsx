import { getApiKeys } from "@/app/actions/api-keys";
import { KeysTable } from "@/components/api-keys/keys-table";
import { CreateKeyDialog } from "@/components/api-keys/create-key-dialog";

export const metadata = {
  title: "API Keys - Key Forge",
  description: "Manage your API keys",
};

export default async function ApiKeysPage() {
  const keys = await getApiKeys();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">API Keys</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your API keys to access Key Forge capabilities programmatically.
          </p>
        </div>
        <CreateKeyDialog />
      </div>

      <div className="mt-8">
        <KeysTable initialKeys={keys} />
      </div>
    </div>
  );
}
