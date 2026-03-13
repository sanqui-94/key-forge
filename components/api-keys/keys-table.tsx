"use client";

import { useTransition, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash, Key, AlertCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getApiKeys, revokeApiKey } from "@/app/actions/api-keys";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApiKey = Awaited<ReturnType<typeof getApiKeys>>[0];

export function KeysTable({ initialKeys }: { initialKeys: ApiKey[] }) {
  const [isPending, startTransition] = useTransition();
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
  const router = useRouter();

  const handleRevoke = async () => {
    if (!keyToRevoke) return;

    startTransition(async () => {
      try {
        await revokeApiKey(keyToRevoke.id);
        setKeyToRevoke(null);
        router.refresh(); // Refresh the page to get updated data
      } catch (error) {
        console.error("Failed to revoke key:", error);
      }
    });
  };

  const getStatusBadge = (key: ApiKey) => {
    if (key.revokedAt) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          Revoked
        </span>
      );
    }
    
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Active
      </span>
    );
  };

  return (
    <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key Prefix</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialKeys.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                No API keys found. Create one to get started.
              </TableCell>
            </TableRow>
          ) : (
            initialKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium text-zinc-900 dark:text-zinc-50">
                  {key.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {key.keyPrefix}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {formatDistanceToNow(new Date(key.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {key.lastUsedAt
                    ? formatDistanceToNow(new Date(key.lastUsedAt), {
                        addSuffix: true,
                      })
                    : "Never"}
                </TableCell>
                <TableCell>{getStatusBadge(key)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => router.push(`/dashboard/keys/${key.id}`)}>
                        <Key className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {!key.revokedAt && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950 dark:focus:text-red-400"
                            onClick={() => setKeyToRevoke(key)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Revoke Key
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!keyToRevoke} onOpenChange={(open) => !open && setKeyToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 dark:text-red-500">
               <AlertCircle className="w-5 h-5 mr-2" />
               Revoke API Key
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the key &quot;
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{keyToRevoke?.name}</span>
              &quot;? Any applications using this key will immediately lose access. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setKeyToRevoke(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevoke} disabled={isPending}>
              {isPending ? "Revoking..." : "Yes, Revoke Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
