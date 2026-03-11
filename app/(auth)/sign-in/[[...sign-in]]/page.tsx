import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
            <SignIn />
        </div>
    );
}
