// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/contexts/Web3Context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AstraVest",
  description: "Decentralized Staking and Vesting Protocol",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}