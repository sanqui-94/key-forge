"use client";

import { useState } from "react";
import { Copy, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createApiKey } from "@/app/actions/api-keys";

export function CreateKeyDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [newKeyData, setNewKeyData] = useState<{ rawKey: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsLoading(true);
      const result = await createApiKey({ name });
      setNewKeyData({ rawKey: result.rawKey, name: result.key.name });
    } catch (error) {
      console.error("Failed to create key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (newKeyData?.rawKey) {
      navigator.clipboard.writeText(newKeyData.rawKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    // If we're closing and there's a new key, reset the state and reload the page to show the new key in the list
    if (!newOpen && newKeyData) {
      setNewKeyData(null);
      setName("");
      window.location.reload();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!newKeyData ? (
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to authenticate your requests to Key Forge.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Key Name
                </label>
                <Input
                  id="name"
                  placeholder="e.g. Production Environment, Developer Laptop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created</DialogTitle>
              <DialogDescription className="text-amber-600 dark:text-amber-500 font-medium">
                Please copy your API key now. For your security, it will never be shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="flex flex-col space-y-2 mb-4">
                <span className="text-sm text-zinc-500">Key Name</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{newKeyData.name}</span>
              </div>
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-zinc-500">Your secret key</span>
                <div className="flex gap-2">
                  <Input readOnly value={newKeyData.rawKey} className="font-mono bg-zinc-50 dark:bg-zinc-900" />
                  <Button type="button" variant="secondary" onClick={copyToClipboard} className="shrink-0">
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)} className="w-full">
                I have copied my key
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
