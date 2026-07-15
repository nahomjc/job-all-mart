import Link from "next/link";
import { env } from "@/lib/env";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <h3 className="mb-2 font-semibold">
            {env.NEXT_PUBLIC_APP_NAME}
          </h3>
          <p className="text-sm text-muted-foreground">
            Job posts for Telegram channels and the website.
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Product</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/jobs" className="hover:text-foreground">Browse jobs</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            <li><Link href="/post/new" className="hover:text-foreground">Post a job</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Telegram</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Use our bot to post from Telegram.</li>
            <li>Start with /start in the bot chat.</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold">Legal</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME}. All rights
          reserved.
        </p>
        <p className="mt-1.5">
          Powered by{" "}
          <a
            href="https://build-with-nahom.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground/80 underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Kingdom Code
          </a>
        </p>
      </div>
    </footer>
  );
}
