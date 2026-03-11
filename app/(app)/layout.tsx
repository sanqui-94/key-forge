import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { KeyIcon, LayoutDashboard, Settings } from "lucide-react";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white dark:bg-zinc-900 hidden md:block">
                <div className="flex h-16 items-center px-6 border-b">
                    <KeyIcon className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-bold text-lg">Key Forge</span>
                </div>

                <nav className="p-4 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <LayoutDashboard className="h-4 w-4 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        href="/keys"
                        className="flex items-center px-4 py-2 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <KeyIcon className="h-4 w-4 mr-3" />
                        API Keys
                    </Link>
                    <Link
                        href="/settings/general"
                        className="flex items-center px-4 py-2 text-sm font-medium text-zinc-600 rounded-md hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                <header className="h-16 border-b bg-white dark:bg-zinc-900 flex items-center justify-between px-6">
                    <div className="md:hidden flex items-center">
                        <KeyIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex items-center space-x-4 ml-auto">
                        <UserButton />
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div >
        </div >
    );
}
