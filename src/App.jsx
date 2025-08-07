import React from "react";
import NotFound from "./container/NotFound";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params';
import { WagmiProvider, createConfig, http } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';

import toast, { ToastBar, Toaster } from "react-hot-toast";
import dotenv from 'dotenv'

import Home from "./container/Home.jsx";
import PrizePool from "./container/PrizePool.jsx";
import {config} from "./config.jsx";
import Dashboard from "./container/Dashboard.jsx";
import { defaultId } from "./utils/constants.ts";
import CoinFlip from "./container/CoinFlip.jsx";
import HowTo from "./container/HowTo.jsx";

dotenv.config()

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || defaultId
console.log("project ID", process.env)

const metadata = {
  name: 'Wave Wealth',
  description: 'Play, Invest,Exchange and Join the Contest with high rewards at Wave Wealth!',
  url: 'https://wavewealth.io',
};


createWeb3Modal({
  themeVariables: {
    '--w3m-accent': '#581c87',
    '--w3m-color-mix': '#004200',
    "--w3m-color-mix-strength": 40,
    '--w3m-border-radius-master': '12px'
  },
  projectId,
  metadata,
  wagmiConfig: config
})

const App = () => {
  return (
    <Router>
      <QueryParamProvider>
        <div>
          <div className="preloader align-items-center justify-content-center">
            <div className="load">
              <hr /><hr /><hr /><hr />
            </div>
          </div>
          <WagmiProvider config={config}>
            <Toaster
              position="top-right"
              reverseOrder={true}
              toastOptions={{ duration: 5000 }}
            >
              {(t) => (
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => toast.dismiss(t.id)}
                >
                  <ToastBar onClick={() => alert(1)} toast={t} />
                </div>
              )}
            </Toaster>
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/prize">
                <PrizePool />
              </Route>
              <Route exact path="/coinflip">
                <CoinFlip />
              </Route>
              <Route exact path="/dashboard">
                <Dashboard />
              </Route>
              <Route exact path="/howto">
                <HowTo />
              </Route>
              <Route exact path="*">
                <NotFound />
              </Route>
            </Switch>
          </WagmiProvider>
          <div className="bottomtotop">
            <i className="fas fa-chevron-right" />
          </div>
        </div>
      </QueryParamProvider>
    </Router>
  );
};

export default App;
