// app/page.js
import ConnectWalletButton from "@/components/web3/ConnectWalletButton";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24 bg-black text-white">
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-2xl font-bold">AstraVest</h1>
        <ConnectWalletButton />
      </header>

      <div className="flex flex-col items-center justify-center flex-1 text-center">
        <h2 className="text-6xl font-extrabold tracking-tighter mb-4">
          The Future of Staking is Here.
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mb-8">
          Stake your tokens, earn rewards with transparent APR & APY, and watch them vest over time in our secure cosmic vault.
        </p>
        <div>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:scale-105 transition-transform">
            Start Staking
          </button>
        </div>
      </div>

      <footer className="w-full max-w-5xl text-center text-gray-500">
        <p>&copy; 2025 AstraVest Protocol</p>
      </footer>
    </main>
  );
}
