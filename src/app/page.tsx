import { TunerApp } from "@/components/tuner/TunerApp";
import { TunerProvider } from "@/context/TunerContext";

export default function Home() {
  return (
    <TunerProvider>
      <TunerApp />
    </TunerProvider>
  );
}
