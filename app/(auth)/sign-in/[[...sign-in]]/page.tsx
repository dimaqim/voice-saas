import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

const lightAppearance = {
  variables: {
    colorPrimary: "#10a37f",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorText: "#0d0d0d",
    colorTextSecondary: "#6e6e80",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "bg-white border-[#e5e5e5] shadow-md",
    headerTitle: "text-[#0d0d0d]",
    headerSubtitle: "text-[#6e6e80]",
    socialButtonsBlockButton:
      "bg-white border-[#e5e5e5] text-[#0d0d0d] hover:bg-[#f9f9f9]",
    formButtonPrimary: "bg-[#10a37f] hover:bg-[#0d8f6e]",
    footerActionLink: "text-[#10a37f]",
    formFieldLabel: "text-[#6e6e80]",
    formFieldInput: "bg-white border-[#e5e5e5] text-[#0d0d0d]",
    identityPreviewText: "text-[#0d0d0d]",
  },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex justify-end p-4">
        <Link
          href="/"
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          ← Back home
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <SignIn
          routing="path"
          path="/sign-in"
          afterSignInUrl="/dashboard"
          appearance={lightAppearance}
        />
      </div>
    </div>
  );
}
