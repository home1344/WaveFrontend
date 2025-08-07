
import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import toast from 'react-hot-toast'
import { readContract, waitForTransaction, writeContract } from '@wagmi/core'
import TopBar from '../components/TopBar.jsx'
import WaveLotteryAbi from '../config/WavePrizePool.json'
import WaveAbi from '../config/Wave.json'
import Footer from '../components/Footer.jsx'
import { getWaveAddress, getWavePrizePoolAddress } from '../utils/addressHelpers.ts'
import { config } from '../config.jsx'
import { shortenAddress } from '../utils/constants.ts'
import Countdown from '../components/Countdown.jsx'

function PrizePool() {
  const { address, isConnected, chain, } = useAccount()
  const activePoolId = 5;
  const megaPoolId = 4;
  const standardChain = 97;
  const [totalAmount, setTotalAmount] = useState(0);
  const [activePoolData, setActivePoolData] = useState();
  const [pending, setPending] = useState(false)
  const [allowance, setAllowance] = useState(0)
  const [ticketPrice, setTicketPrice] = useState(0)
  const [limitTime, setLimitTime] = useState(0)

  const [megaPoolData, setMegaPoolData] = useState();
  const [megaLimitTime, setMegaLimitTime] = useState(0)
  const [megaTicketPrice, setMegaTicketPrice] = useState(0)

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const _totalBalance = await readContract(config, {
          address: getWaveAddress(chain?.id ?? standardChain),
          abi: WaveAbi,
          functionName: 'balanceOf',
          args: [getWavePrizePoolAddress(chain?.id ?? standardChain)],
          chainId: chain?.id ?? standardChain
        })

        const _activePoolData = await readContract(config, {
          address: getWavePrizePoolAddress(chain?.id ?? standardChain),
          abi: WaveLotteryAbi,
          functionName: 'getPoolInfo',
          args: [activePoolId],
          chainId: chain?.id ?? standardChain
        })

        const _megaPoolData = await readContract(config, {
          address: getWavePrizePoolAddress(chain?.id ?? standardChain),
          abi: WaveLotteryAbi,
          functionName: 'getPoolInfo',
          args: [megaPoolId],
          chainId: chain?.id ?? standardChain
        })

        setTotalAmount(_totalBalance.toString())
        setActivePoolData(_activePoolData)
        setTicketPrice(_activePoolData[8])
        setLimitTime(Number(_activePoolData[7]))

        setMegaPoolData(_megaPoolData)
        setMegaLimitTime(Number(_megaPoolData[7]))
        setMegaTicketPrice(_megaPoolData[8])
      } catch (error) {
        console.error('Error fetching total amount:', chain?.id ?? standardChain, error);
      }
    };
    fetchInitData();
  }, [chain, pending]);

  useEffect(() => {
    const fetchAccountData = async () => {
      const _allowance = await readContract(config, {
        address: getWaveAddress(chain?.id ?? standardChain),
        abi: WaveAbi,
        functionName: 'allowance',
        args: [address, getWavePrizePoolAddress(chain?.id ?? standardChain)],
        chainId: chain?.id ?? standardChain
      })
      setAllowance(_allowance.toString())
    }
    if (address) {
      fetchAccountData()
    }
  }, [address, chain, pending]);

  const buyTicketsHandler = async () => {
    if (!chain || chain?.id !== standardChain || !address) {
      toast.error('Wallet Connect is needed')
      return
    }
    if (pending) {
      toast.error('Transaction is pending')
      return
    }
    console.log('buyFunction', chain?.id)

    const buy = await writeContract(config, {
      address: getWavePrizePoolAddress(chain?.id ?? standardChain),
      abi: WaveLotteryAbi,
      functionName: 'enterPool',
      args: [activePoolId, Number(activePoolData[8])],
      chainId: chain?.id ?? standardChain,
    })

    setPending(true)

    await waitForTransaction(config, {
      hash: buy
    })
    setPending(false)
    toast.success('Buy Ticket Transaction confirmed successfully.')
  }

  const buyMegaTicketsHandler = async () => {
    if (!chain || chain?.id !== standardChain || !address) {
      toast.error('Wallet Connect is needed')
      return
    }
    if (pending) {
      toast.error('Transaction is pending')
      return
    }

    const buy = await writeContract(config, {
      address: getWavePrizePoolAddress(chain?.id ?? standardChain),
      abi: WaveLotteryAbi,
      functionName: 'enterPool',
      args: [megaPoolId, Number(megaPoolData[8])],
      chainId: chain?.id ?? standardChain,
    })

    setPending(true)

    await waitForTransaction(config, {
      hash: buy
    })
    setPending(false)
    toast.success('Buy Mega Ticket Transaction confirmed successfully.')
  }

  const approveHandler = async () => {
    if (!chain || chain?.id !== standardChain || !address) {
      toast.error('Wallet Connect is needed')
      return
    }
    if (pending) {
      toast.error('Transaction is pending')
      return
    }
    const approve = await writeContract(config, {
      address: getWaveAddress(chain?.id ?? standardChain),
      abi: WaveAbi,
      functionName: 'approve',
      // value: BigInt(web3Clients[chainId].utils.toWei(String(minTicketPrice), 'ether')),
      args: [getWavePrizePoolAddress(chain?.id ?? standardChain), 1000000000000000000000],
      chainId: chain?.id ?? standardChain,
      gasLimit: 150_000_000n
    })

    setPending(true)
    await waitForTransaction(config, {
      hash: approve
    })
    setPending(false)

    toast.success('Approve Transaction confirmed successfully.')
  }

  console.log('limitTime', limitTime)

  const leaderboardData = [
    { id: 1, name: '123456789', points: 500 },
    { id: 2, name: '123456789', points: 450 },
    { id: 3, name: '123456789', points: 400 },
    { id: 4, name: '123456789', points: 350 },
    { id: 5, name: '123456789', points: 300 },
  ];

  const joinFeedData = [
    { id: 1, name: '123456789', points: 500 },
    { id: 2, name: '123456789', points: 450 },
    { id: 3, name: '123456789', points: 400 },
    { id: 4, name: '123456789', points: 350 },
    { id: 5, name: '123456789', points: 300 },
  ];

  return (
    <>
      <TopBar />
      <div className="hero-area pool">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 d-flex align-self-center">
              <div className="left-content">
                <div className="content">
                  <h1 className="title">
                    Prize Pool
                  </h1>
                  <p className="text">
                    Step into the Wave Wealth arena and unlock the chance to win big!
                    Our prize pool is transparent, community-driven, and constantly growing, all powered by your participation and excitement.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="hero-img2 d-block d-md-none">
                <img src="assets/images/pools/prize-pool.png" alt="" />
              </div>
              <div className="hero-img d-none d-md-block">
                <img className="shape man" src="assets/images/pools/prize-pool.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>      

      <section className="lottery-area">
        <div className="lottery-staticstics">
          <div className="container">
            <div className="row">
              <div className="col-lg-4">
                <div className="single-staticstics">
                  <div className='balance-row'>
                    <div className="left">
                      <img src="assets/images/pools/prize1.gif" alt="" />
                    </div>
                    <div className="right">
                      <div className="count">
                        <img src="/logo.png" alt="" width={40} />
                        <span>{new Intl.NumberFormat().format(totalAmount / 10 ** 18)}</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="title">Prize Pool Amount</h4>
                </div>

              </div>
              <div className="col-lg-4">
                <div className="single-staticstics">
                  <div className='balance-row'>
                    <div className="left">
                      <img src="assets/images/pools/prize2.gif" alt="" />
                    </div>
                    <div className="right">
                      <div className="count">
                        <img src="/logo.png" alt="" width={40} />
                        <span>{activePoolData && new Intl.NumberFormat().format(Number(activePoolData[6]) / 10 ** 18)}</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="title">Prize Pool Limit Amount</h4>

                </div>
              </div>
              <div className="col-lg-4">
                <div className="single-staticstics">
                  <div className='balance-row'>
                    <div className="left">
                      <div className="icon">
                        <img src="assets/images/pools/prize3.gif" alt="" />
                      </div>
                    </div>
                    <div className="right">
                      <div className="count">
                        <img src="/logo.png" alt="" width={40} />
                        <span>{activePoolData && (1000 - Number(activePoolData[1]) - Number(activePoolData[2])) / 10}%</span>
                      </div>
                    </div>
                  </div>
                  <h4 className="title">Reward Rate</h4>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="daily-lottery">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-md-10">
                <div className="section-heading">
                  {/* <h5 className="subtitle">
                    Try to check out our
                  </h5> */}
                  <h2 className="title">
                    Prize Pools
                  </h2>
                  {/* <p className="text">
                    We update our site regularly; more and more winners are added every day! To locate the
                    most recent winner's information
                  </p> */}
                </div>
              </div>
            </div>
            <div className='row'>
              <div className="col-lg-12">
                <div className='game-rules'>
                  <h4 className="title">
                    Game Rules
                  </h4>
                  <ul>
                    <li>Auto Winner Selected</li>
                    <li>Everybody has a chance to win. The winner is selected randomly from all tickets purchased by players.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='prize-pools'>
        <div className="container">
          <div className="row align-items-stretch">
            <div className="col-lg-8">
              {/* Mega Prize Pool */}
              <div className="row" style={{ marginTop: '36px', position: 'relative' }}>
                <div className='col-lg-12'>
                  <div className='mega-prize-pool'>
                      <img src='assets/images/pools/pool2.gif' alt='' />
                    <div className='right'>
                      <div className='r-row'>
                        <div className='content'>
                          <h5 className="subtitle">
                            &nbsp;
                          </h5>
                          <h4 className='title'>MEGA WAVE</h4>
                          <p>Big Monthly Prize</p>
                        </div>
                        <div className='amount amount-position'>
                          <h4 className='value'><img src="/logo.png" alt="" width={40} className='prize-currency' />{megaPoolData && new Intl.NumberFormat().format(Number(megaPoolData[6]) / 10 ** 18)}</h4>
                        </div>
                      </div>
                      <div className='r-row prizes-requirements'>
                        <div className='d-flex'>
                          <div className='item'>
                            <p className='joined-players-text'>Required XP:</p>
                            <div className="count">
                              <img src="/logo.png" alt="" width={40} />
                              <span>{megaTicketPrice && new Intl.NumberFormat().format(Number(megaTicketPrice) / 10 ** 18)}</span>
                            </div>
                          </div>
                          <div className='item ml-2'>
                            <p className='joined-players-text'>Players Joined:</p>
                            <div className="count">
                              <img src="/assets/images/users.png" alt="" width={40} />
                              <span>{megaPoolData && megaPoolData[5].length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='prize timer-inner'>
                        <Countdown futureDate={megaLimitTime} />
                      </div>
                      <div className='r-row'>
                        <div></div>
                        {/*<div className="join-game link join-button-transparent">Connect Wallet <i
                          className="fas fa-arrow-right"></i></div>*/}
                        <div className="join-game link join-button join-button-text" onClick={allowance > megaTicketPrice ? buyMegaTicketsHandler : approveHandler}>{allowance > megaTicketPrice ? 'Join Game' : 'Approve'} <i
                          className="fas fa-arrow-right"></i></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Prize Pool */}
              <div className="row" style={{ marginTop: '36px', position: 'relative' }}>
                <div className='col-lg-12'>
                  <div className='mega-prize-pool'>
                    <div className='left left-position'>
                      <img src='assets/images/pools/pool1.gif' alt='' />
                    </div>
                    <div className='right'>
                      <div className='r-row'>
                        <div className='content'>
                          <h5 className="subtitle">
                            DAILY WAIVE
                          </h5>
                          <h4 className='title'>Daily Winners</h4>
                          <h4 className='title'>Daily Fun</h4>
                          <p>Daily Prize</p>
                        </div>
                        <div className='amount amount-position'>
                          <h4 className='value'>
                            <img src="/logo.png" alt="" width={40} className='prize-currency' />
                            {activePoolData && new Intl.NumberFormat().format(Number(activePoolData[6]) / 10 ** 18)}
                          </h4>
                        </div>
                      </div>
                      <div className='r-row prizes-requirements'>
                        <div className='d-flex'>
                          <div className='item'>
                            <p className='joined-players-text'>Required XP:</p>
                            <div className="count">
                              <img src="/logo.png" alt="" width={40} />
                              <span>{ticketPrice && new Intl.NumberFormat().format(Number(ticketPrice) / 10 ** 18)}</span>
                            </div>
                          </div>
                          <div className='item ml-2'>
                            <p className='joined-players-text'>Players Joined:</p>
                            <div className="count">
                              <img src="/assets/images/users.png" alt="" width={40} />
                              <span>{activePoolData && activePoolData[5].length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='prize-daily timer-inner'>
                        <Countdown futureDate={limitTime} />
                      </div>
                      <div className='r-row'>
                        <div></div>
                        {/*<div className="join-game link join-button-transparent">Connect Wallet <i
                          className="fas fa-arrow-right"></i></div>*/}
                        <div className="join-game link join-button join-button-text" onClick={allowance > ticketPrice ? buyTicketsHandler : approveHandler}>{allowance > ticketPrice ? 'Join Game' : 'Approve'} <i
                          className="fas fa-arrow-right"></i></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coin Flip Prize Pool */}
              <div className="row" style={{ marginTop: '36px', position: 'relative' }}>
                <div className='col-lg-12'>
                  <div className='mega-prize-pool'>
                    <div className='left left-position left-position-3'>
                      <img src='assets/images/pools/pool3.gif' alt='' />
                    </div>
                    <div className='right'>
                      <div className='r-row'>
                        <div className='content'>
                          <h5 className="subtitle">
                            COIN FLIP
                          </h5>
                          <h4 className='title'>Fast 50/50 Challange</h4>
                          <p>Daily Prize</p>
                        </div>
                        <div className='amount amount-position'>
                          <h4 className='value'>
                            <img src="/logo.png" alt="" width={40} className='prize-currency' />
                            {activePoolData && new Intl.NumberFormat().format(Number(activePoolData[6]) / 10 ** 18)}
                          </h4>
                        </div>
                      </div>
                      <div className='r-row prizes-requirements'>
                        <div className='d-flex'>
                          <div className='item'>
                            <p className='joined-players-text'>Required XP:</p>
                            <div className="count">
                              <img src="/logo.png" alt="" width={40} />
                              <span>{ticketPrice && new Intl.NumberFormat().format(Number(ticketPrice) / 10 ** 18)}</span>
                            </div>
                          </div>
                          <div className='item ml-2'>
                            <p className='joined-players-text'>Players Joined:</p>
                            <div className="count">
                              <img src="/assets/images/users.png" alt="" width={40} />
                              <span>{activePoolData && activePoolData[5].length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='prize-daily timer-inner'>
                        <Countdown futureDate={limitTime} />
                      </div>
                      <div className='r-row'>
                        <div></div>
                        {/*<div className="join-game link join-button-transparent">Connect Wallet <i
                          className="fas fa-arrow-right"></i></div>*/}
                        <div className="join-game link join-button join-button-text" onClick={allowance > ticketPrice ? buyTicketsHandler : approveHandler}>{allowance > ticketPrice ? 'Join Game' : 'Approve'} <i
                          className="fas fa-arrow-right"></i></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard and Join Feed Column */}
            <div className="col-lg-4 d-flex"> {/* Added d-flex */}
              <div className="leaderboard-box flex-grow-1"> {/* Added flex-grow-1 */}
                <div className="leaderboard-icon">
                  <img src="/assets/images/leaderboard.svg" alt="Leaderboard" width={48} height={48} />
                </div>
                <h3 className="leaderboard-title">Leaderboard</h3>
                <div className="table-container">
                  {leaderboardData.map((item) => (
                    <div className="leaderboard-row" key={item.id}>
                      <div className="avatar-column">
                        <img src="/assets/images/avatar.png" alt="Avatar" className="avatar" />
                      </div>
                      <div className="name-column">
                        <span className="name-placeholder">{item.name}</span>
                      </div>
                      <div className="points-column">
                        <img src="/logo.png" alt="Logo" className="points-logo" />
                        <span className="points-value">{item.points}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 className="leaderboard-title">Join Feed</h3>
                <div className="table-container">
                  {joinFeedData.map((item) => (
                    <div className="leaderboard-row" key={item.id}>
                      <div className="avatar-column">
                        <img src="/assets/images/avatar.png" alt="Avatar" className="avatar" />
                      </div>
                      <div className="name-column">
                        <span className="name-placeholder">{item.name}</span>
                      </div>
                      <div className="points-column">
                        <img src="/logo.png" alt="Logo" className="points-logo" />
                        <span className="points-value">{item.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="activities">
        <img className="shape shape1" src="assets/images/people/shape1.png" alt="" />
        <img className="shape shape2" src="assets/images/people/shape2.png" alt="" />
        <img className="shape shape3" src="assets/images/people/shape3.png" alt="" />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="section-heading">
                <h5 className="subtitle">
                  Daily Prize Pool
                </h5>
                <h2 className="title">
                  Latest Activities
                </h2>
                <p className="text">
                  The world’s first truly fair and global prize pool. Every player has a fair shot at today's prize.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="tab-menu-area">
                <ul className="nav nav-lend mb-3" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button className="nav-link active" id="purchased-tickets-tab" data-bs-toggle="tab"
                      data-bs-target="#purchased-tickets" type="button" role="tab"
                      aria-controls="purchased-tickets" aria-selected="true">purchased tickets</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="my-tickets-tab" data-bs-toggle="tab"
                      data-bs-target="#my-tickets" type="button" role="tab" aria-controls="my-tickets"
                      aria-selected="false">my tickets</button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button className="nav-link" id="history-tab" data-bs-toggle="tab" data-bs-target="#history"
                      type="button" role="tab" aria-controls="history"
                      aria-selected="false">history</button>
                  </li>
                </ul>
              </div>
              <div className="tab-content">
                <div className="tab-pane fade show active" id="purchased-tickets" role="tabpanel"
                  aria-labelledby="purchased-tickets-tab">
                  <div className="responsive-table">
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col">Wallet Address</th>
                          <th scope="col">Entry Time</th>
                          <th scope="col">XP Used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePoolData && activePoolData[5].map((item, index) => (
                          <tr key={index}>
                            <td>
                              {shortenAddress(item.user, 5)}
                            </td>
                            <td>
                              {new Date(Number(item.betTime) * 1000).toLocaleString()}
                            </td>
                            <td>
                              <img src="/logo.png" alt="" width={20} style={{ marginRight: '2px', marginBottom: '4px' }} />
                              {new Intl.NumberFormat().format(Number(item.xpAmount) / 10 ** 18)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="tab-pane fade" id="my-tickets" role="tabpanel" aria-labelledby="my-tickets-tab">
                  <div className="responsive-table">
                    <table className="table">
                      <thead>
                        <tr>
                          <th scope="col">Wallet Address</th>
                          <th scope="col">Ticket numbers</th>
                          <th scope="col">Tickets</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activePoolData && activePoolData[5].filter((item) => item.user == address).map((item, index) => (
                          <tr key={index}>
                            <td>
                              {shortenAddress(item.user, 5)}
                            </td>
                            <td>
                              {new Date(Number(item.betTime) * 1000).toLocaleString()}
                            </td>
                            <td>
                              <img src="/logo.png" alt="" width={20} style={{ marginRight: '2px', marginBottom: '4px' }} />
                              {new Intl.NumberFormat().format(Number(item.xpAmount) / 10 ** 18)}
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
      </section>
      <Footer />

    </>
  )
}

export default PrizePool
