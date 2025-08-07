
import React, {useState, useEffect} from 'react'
import { useAccount } from 'wagmi'
import { readContract } from '@wagmi/core'
import TopBar from '../components/TopBar'
import Featured from '../components/Featured'
import Activities from '../components/Activities'
import Footer from '../components/Footer'
import Hero from '../components/Hero'
import Pools from '../components/Pools'
import WaveLotteryAbi from '../config/WavePrizePool.json'
import { config } from '../config.jsx'
import { getWavePrizePoolAddress } from '../utils/addressHelpers.ts'

function Home() {
  const { address, isConnected, chain, } = useAccount()
  const megaPoolId = 4;
  const standardChain = 97;
  const [megaPoolData, setMegaPoolData] = useState();
  const [megaLimitTime, setMegaLimitTime] = useState(0)
  
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const _megaPoolData = await readContract(config, {
          address: getWavePrizePoolAddress(chain?.id ?? standardChain),
          abi: WaveLotteryAbi,
          functionName: 'getPoolInfo',
          args: [megaPoolId],
          chainId: chain?.id ?? standardChain
        })

        setMegaPoolData(_megaPoolData)
        setMegaLimitTime(Number(_megaPoolData[7]))
      } catch (error) {
        console.error('Error fetching total amount:', chain?.id ?? standardChain, error);
      }
    };

    fetchInitData();
  }, [chain]);

  return (
    <>
      <TopBar />
      <Hero />
      <Featured />
      <Pools megaLimitTime={megaLimitTime} megaPoolData={megaPoolData} />
      {/* <Activities /> */}
      <Footer />
    </>
  )
}

export default Home
