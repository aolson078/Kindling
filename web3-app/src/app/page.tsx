import ConnectPanel from "@/components/ConnectPanel";

export default function Home() {
  return (
    <main className="min-h-screen p-8 sm:p-20">
      <h1 className="text-2xl font-semibold mb-6">Web3 starter</h1>
      <ConnectPanel />
    </main>
  );
}
