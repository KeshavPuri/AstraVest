// contexts/Web3Context.js
"use client";

import React, { useState, useEffect, useContext, createContext } from 'react';
import { ethers } from 'ethers';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [address, setAddress] = useState(null);

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
                await web3Provider.send("eth_requestAccounts", []);
                const web3Signer = web3Provider.getSigner();
                const userAddress = await web3Signer.getAddress();

                setProvider(web3Provider);
                setSigner(web3Signer);
                setAddress(userAddress);
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            console.log('MetaMask is not installed!');
        }
    };

    return (
        <Web3Context.Provider value={{ provider, signer, address, connectWallet }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = () => useContext(Web3Context);