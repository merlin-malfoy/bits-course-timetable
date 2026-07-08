import { NameForm } from "@/components/start/NameForm";
import { QuoteCard } from "@/components/start/QuoteCard";

export default function StartPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <NameForm />
      <QuoteCard />
    </div>
  );
}
