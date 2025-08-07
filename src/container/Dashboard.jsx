
import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'
import { readContract, waitForTransaction, writeContract } from '@wagmi/core'
import { getWaveAddress, getWavePrizePoolAddress } from '../utils/addressHelpers.ts'
import { config } from '../config'
import { gamePlayers, shortenAddress } from '../utils/constants.ts'
import WaveLotteryAbi from '../config/WavePrizePool.json'
import WaveAbi from '../config/Wave.json'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'

function Dashboard() {
  const { address, isConnected, chain, } = useAccount()
  const activePoolId = 1;
  const standardChain = 97;
  const [xpBlance, setXpBalance] = useState(0);
  const [activePoolData, setActivePoolData] = useState();
  const [pending, setPending] = useState(false)
  const [allowance, setAllowance] = useState(0)

  useEffect(() => {
    const fetchAccountData = async () => {
      const _allowance = await readContract(config, {
        address: getWaveAddress(chain?.id ?? standardChain),
        abi: WaveAbi,
        functionName: 'allowance',
        args: [address, getWavePrizePoolAddress(chain?.id ?? standardChain)],
        chainId: chain?.id ?? standardChain
      })

      const _xpBalance = await readContract(config, {
        address: getWaveAddress(chain?.id ?? standardChain),
        abi: WaveAbi,
        functionName: 'balanceOf',
        args: [address],
        chainId: chain?.id ?? standardChain
      })

      setAllowance(_allowance.toString())
      setXpBalance(_xpBalance.toString())
    }
    if (address) {
      fetchAccountData()
    }
  }, [address, chain, pending]);

  return (
    <>
      <TopBar />
      <section className='dashboard-area'>
        <div className='container'>
          <h4 className='page-title'> Your Dashboard</h4>
          <p>Track your progress, monitor your rewards, and stay ahead in the game. 
            Everything you need to know about your performance is right here.</p>
          <h4 className='sub-title'>XP & Ticket Tracker</h4>
          <div className='xp-status row'>
            <div className="col-lg-4 col-md-6">
              <div className="xp-box">
                <div className='balance'>
                  <img src='/logo.png' alt='logo' width={64} height={64} />
                  <span>50</span>
                </div>
                <p>Total XP Earned</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="xp-box">
                <div className='balance'>
                  <img src='/logo.png' alt='logo' width={64} height={64} />
                  <span>1550</span>
                </div>
                <p>Total XP Spent</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="xp-box">
                <div className='balance'>
                  <img src='/logo.png' alt='logo' width={64} height={64} />
                  <span>50</span>
                </div>
                <p>Active Tickets</p>
              </div>
            </div>
          </div>
          <h4 className='sub-title'>Claim Bonus</h4>
          <p className='description'>We update our site regularly; more and more winners are added every day! To locate the most recent winner's information</p>

          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="single-awards xp-balance">
                <div className="content">
                  <div className='icon'>
                    <img src="/logo.png" width={80} alt="" />
                  </div>
                  <h4 className="title">
                    XP balance
                  </h4>
                  <div className='balance'>
                    {new Intl.NumberFormat().format(xpBlance / 10 ** 18)}
                  </div>
                  <a href="#" className="mybtn2 xp-balance">Buy More</a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="single-awards referral-members">
                <div className="content">
                  <div className='icon'>
                    <img src="assets/images/awards/ref.gif" alt="" />
                  </div>
                  <h4 className="title">
                    Referral Members
                  </h4>
                  <p>
                    <i className="fas fa-users"></i>2
                  </p>
                  <a href="#" className="mybtn2 referral-members">View Details</a>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="single-awards claim-bonus">
                <div className="content">

                  <div className='icon'>
                    <img src="assets/images/awards/claim.gif" width={80} alt="" />
                  </div>
                  <h4 className="title">
                    Claim Bonus
                  </h4>
                  <div className='balance'>
                    1.56
                  </div>
                  <a href="#" className="mybtn2 claim-bonus">Claim</a>
                </div>
              </div>
            </div>

          </div>
          <div className="activities">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8 col-md-10">
                  <div className="section-heading">
                    <h5 className="subtitle">
                      The Smarter Way
                    </h5>
                    <h2 className="title">
                      Wave Raiders
                    </h2>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <div className="tab-content">
                    <div className="tab-pane fade show active" id="all-bets" role="tabpanel" aria-labelledby="all-bets-tab">
                      <div className="responsive-table">
                        <table className="table">
                          <thead>
                            <tr>
                              <th scope="col">USER</th>
                              <th scope="col">XP USED</th>
                              <th scope="col">GAME</th>
                              <th scope="col">PROFIT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gamePlayers.map((player, index) => (
                              <tr key={index}>
                                <td>
                                  {shortenAddress(player.address, 4)}
                                </td>
                                <td>
                                  <img src={'/logo.png'} alt="" />
                                  {player.xp_used}
                                </td>
                                {/* <td>{player.chance}</td> */}
                                <td>{player.game}</td>
                                <td>
                                  <img src={'/logo.png'} alt="" />
                                  {player.profit}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </>
  )
}

export default Dashboard
