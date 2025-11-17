export const metadata = { title: "About | traff-29" };

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">About this Project:</h1>
      <p className="mt-4 leading-7 text-[var(--text-secondary)]">
        As a Bengaluru resident, daily commutes across one of the world’s most congested road
        networks take over an hour and a half in the morning and nearly two in the evening—even for
        ~20 km. In a city celebrated for digital innovation, this raises a question: why does
        congestion persist? Traffic isn’t random—it’s a complex pattern of human behaviour,
        infrastructure, and politics. This project explores how AI can visualise those patterns in
        ways people can understand and act on.
      </p>
      <p className="mt-4 leading-7 text-[var(--text-secondary)]">
        I enjoy building things at the intersection of maths, science, and design—AI calendars,
        study tools, smart locks, and home automation. But I’ve never applied these skills to a
        large-scale social challenge. Here, I’ll use AI not as a direct solution to traffic but as
        a vehicle for awareness and mindset change.
      </p>
  <div className="mt-6 rounded-lg border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
        <h2 className="font-semibold text-[var(--foreground)]">Learning Goal</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          Apply AI—data analysis, NLP, and rule-based models—to model and visualise urban traffic
          with real-time data in an interactive web platform (React + Python + Google Maps + PyTorch).
        </p>
        <ul className="mt-3 list-disc pl-5 text-[var(--text-secondary)]">
          <li>Create models that interpret density, flow, and incidents, linking to social, economic, environmental, and political impacts.</li>
          <li>Study ML bias, urban modelling, and ethics to ensure fairness and transparency.</li>
          <li>Design a responsive UI that turns complex data into engaging, shareable narratives.</li>
        </ul>
      </div>
  <div className="mt-6 rounded-lg border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
        <h2 className="font-semibold text-[var(--foreground)]">Why AI?</h2>
        <p className="mt-2 text-[var(--text-secondary)]">
          AI exposes hidden relationships that static campaigns miss. It lets people see and
          interact with dynamics—bridging technical data and human understanding.
        </p>
      </div>
  <div className="mt-6 rounded-lg border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
        <h2 className="font-semibold text-[var(--foreground)]">Outcomes</h2>
        <ul className="mt-2 list-disc pl-5 text-[var(--text-secondary)]">
          <li>Explain how AI simulates and analyses real-world traffic.</li>
          <li>Publish an interactive app where users adjust time/location to see SEEP impacts.</li>
          <li>Communicate insights via AI-generated stories and animations.</li>
          <li>Reflect on how tech raises awareness—not just powers solutions.</li>
        </ul>
      </div>
    </section>
  );
}
