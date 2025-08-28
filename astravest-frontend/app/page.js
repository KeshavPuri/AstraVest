// app/page.js
import ConnectWalletButton from "@/components/web3/ConnectWalletButton";
import Link from "next/link"; // 1. Import Link

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24 bg-black text-white">
      {/* ... header and other content remains the same ... */}
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        {/* ... h2 and p tags remain the same ... */}
        <div>
          {/* 2. Wrap the button in a Link component */}
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:scale-105 transition-transform">
              Launch App
            </button>
          </Link>
        </div>
      </div>
      <footer className="w-full max-w-5xl text-center text-gray-500">
        <p>&copy; 2025 AstraVest Protocol</p>
      </footer>
    </main>
  );
}