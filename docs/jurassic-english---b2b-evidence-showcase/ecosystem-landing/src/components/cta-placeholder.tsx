"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export function CTAPlaceholder({ title, message }: { title: string, message: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-primary mb-4 text-center">{title}</h1>
      <p className="text-muted-foreground text-lg text-center max-w-md mb-8">
        {message}
      </p>
      <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 max-w-md w-full mb-8 text-center text-sm text-foreground/80">
        This is a placeholder page for the vertical-slice demo. In a production environment, this would integrate with a scheduling tool (like Calendly) or an enrollment form.
      </div>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Ecosystem
      </Link>
    </div>
  );
}
