import { getApiKeyDetails } from "@/app/actions/api-keys";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeft, Key, Activity, ListOrdered, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

export default async function KeyDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  
  let keyData;
  try {
    keyData = await getApiKeyDetails(id);
  } catch (error) {
    notFound();
  }

  const isRevoked = !!keyData.revokedAt;
  const isExpired = keyData.expiresAt && new Date(keyData.expiresAt) < new Date();
  
  let statusBadge;
  if (isRevoked) {
    statusBadge = (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Revoked on {format(new Date(keyData.revokedAt!), "MMM d, yyyy")}
      </span>
    );
  } else if (isExpired) {
    statusBadge = (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        Expired
      </span>
    );
  } else {
    statusBadge = (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Active
      </span>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/keys">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center">
            {keyData.name}
            <span className="ml-3">{statusBadge}</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {keyData.keyPrefix} • Created {formatDistanceToNow(new Date(keyData.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center mb-4">
              <Key className="mr-2 h-4 w-4" />
              Key Properties
            </h3>
            
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-zinc-500 mb-1">Key ID</dt>
                <dd className="text-sm font-mono bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800">{keyData.id}</dd>
              </div>
              
              <div>
                <dt className="text-xs text-zinc-500 mb-1">Prefix</dt>
                <dd className="text-sm font-mono bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800 break-all">{keyData.keyPrefix}</dd>
              </div>

              <div>
                <dt className="text-xs text-zinc-500 mb-1 pt-2 border-t border-zinc-100 dark:border-zinc-800">Scopes</dt>
                <dd className="text-sm">
                  {keyData.scopes.map(scope => (
                     <span key={scope} className="inline-flex mr-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                       {scope}
                     </span>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 flex items-center mb-4">
              <Calendar className="mr-2 h-4 w-4" />
              Timeline
            </h3>
            
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-sm text-zinc-500">Created At</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-50">{format(new Date(keyData.createdAt), "MMM d, yyyy")}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm text-zinc-500">Last Used</dt>
                <dd className="text-sm text-zinc-900 dark:text-zinc-50">
                  {keyData.lastUsedAt ? formatDistanceToNow(new Date(keyData.lastUsedAt), { addSuffix: true }) : "Never"}
                </dd>
              </div>
              {keyData.expiresAt && (
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-zinc-500">Expires</dt>
                  <dd className="text-sm text-zinc-900 dark:text-zinc-50">{format(new Date(keyData.expiresAt), "MMM d, yyyy")}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 flex items-center justify-between mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="flex items-center">
                <Activity className="mr-2 h-4 w-4 text-zinc-500" />
                Recent Usage Logs
              </span>
              <span className="text-xs font-normal text-zinc-500">Showing last 50 requests</span>
            </h3>
            
            {keyData.UsageLog && keyData.UsageLog.length > 0 ? (
              <div className="space-y-4">
                {keyData.UsageLog.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${log.status >= 200 && log.status < 300 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{log.endpoint}</span>
                        <span className="text-xs text-zinc-500 font-mono">Status: {log.status}</span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 mt-2 sm:mt-0 text-right">
                      {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <ListOrdered className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-4" />
                <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">No usage data</h4>
                <p className="text-sm text-zinc-500 mt-1">This key hasn't been used yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
