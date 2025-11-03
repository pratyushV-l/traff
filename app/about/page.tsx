export const metadata = { title: "About | traff-29" };

export default function AboutPage() {
  return (
    <section className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">About</h1>
      <p className="mt-4 text-[var(--text-secondary)]">
        traff-29 is an AI-powered traffic awareness project from Bengaluru focused on modelling,
        visualising, and communicating the patterns behind congestion.
      </p>
    </section>
  );
}
