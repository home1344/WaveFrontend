import React, { useState, useEffect, useMemo} from 'react';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { readContract, waitForTransaction, writeContract } from '@wagmi/core';
import TopBar from '../components/TopBar.jsx';
import WaveFlipAbi from '../config/WaveChallengeFlip.json';
import WaveAbi from '../config/XPToken.json';
import Footer from '../components/Footer.jsx';
import {
  getXPTokenAddress,
  getWaveFlipChallengeAddress
} from '../utils/addressHelpers.ts';
import { config } from '../config.jsx';
import { shortenAddress } from '../utils/constants.ts';
import { formatBlockTimestamp } from '../utils/constants.ts';
import { formatDatetime } from '../utils/constants.ts';
import { ethers } from "ethers";

import SocketLeaderboard from '../components/SocketLeaderboard';

function CoinFlip() {
  const { address, chain } = useAccount();
  
  const standardChain = 11155111; // Sepolia

  // --- State ---
  const [gameIds, setGameIds] = useState([]);
  const [gameMinTokenAmount, setGameMinTokenAmount] = useState([]);
  const [newGameId, setNewGameId] = useState(null);
  const [historyChallenge, setHistoryChallenge] = useState([]);
  const [HistoryGame, setHistoryGame] = useState([]);
  const [pending, setPending] = useState(false);
  const [updated, setUpdated] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const [isHead, setIsHead] = useState(true);
  const [wager, setWager] = useState(0);
  const [events, setEvents] = useState([]);
  const [coinflipHistory, setCoinflipHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50); // You can make this dynamic if you want
  const [totalPages, setTotalPages] = useState(1);


  //fetch data from backend by socket
  useEffect(() => {
    const fetchWinners = async () => {
      try {
        
        const res = await fetch(`http://192.168.0.67:5000/api/bets/gamehistory?page=${page}&limit=${limit}`);
        const data = await res.json();
        setCoinflipHistory(data.history || []);
      } catch (err) {
        console.error("Failed to fetch winners:", err);
      }
    };
    fetchWinners();
  }, [page, limit]); // Re-fetch when page or limit changes

  // --- Fetch games & challenges ---
  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const chainId = chain?.id ?? standardChain;
        const gameContract = getWaveFlipChallengeAddress(chainId);

        // Fetch games
        const _gameIdsResult = await readContract(config, {
          address: gameContract,
          abi: WaveFlipAbi,
          functionName: 'getGameIds',
          args: [],
          chainId
        });

        const [gamelen, _gameIds] = _gameIdsResult;
        setGameIds(_gameIds);

        let _gameInfo = [];
        let _gameMinTokenAmount = [];

        if (gamelen > 0) {
          _gameInfo = await Promise.all(
            _gameIds.map(async (gid) => {
              const res = await readContract(config, {
                address: gameContract,
                abi: WaveFlipAbi,
                functionName: 'getGameInfo',
                args: [gid],
                chainId
              });
              // save minTokenAmount for button rendering
              _gameMinTokenAmount.push(Number(res[5])); // assuming it's a BigNumber
              return {
                id: gid,
                baseToken: res[0],
                burnFee: res[1],
                treasuryFee: res[2],
                totalXpAmount: res[3],
                challengeIds: res[4],
                minTokenAmount: Number(res[5]),
                isActive: res[6]
              };
            })
          );
        }
        setGameMinTokenAmount(_gameMinTokenAmount);
        setHistoryGame(_gameInfo);

        // Fetch challenges
        const _challengeIdsResult = await readContract(config, {
          address: gameContract,
          abi: WaveFlipAbi,
          functionName: 'getAllChallengeIds',
          args: [],
          chainId
        });

        const [challengelen, challengeIds] = _challengeIdsResult;

        let _challengeInfo = [];
        if (challengelen > 0) {
          _challengeInfo = await Promise.all(
            challengeIds.map(async (cid) => {
              const res = await readContract(config, {
                address: gameContract,
                abi: WaveFlipAbi,
                functionName: 'getChallengeInfo',
                args: [cid],
                chainId
              });
              // If your backend returns objects instead of arrays, adjust accordingly!
              return {
                challengeId: cid,
                gameId: res[0],
                creator: res[1],
                challenger: res[2],
                isActive: res[3],
                result: res[4],
                createTime: res[5],
                drawTime: res[6],
                xpAmount: res[7],
                // Add creator.side if possible for UI
              };
            })
          );
        }
        setHistoryChallenge(_challengeInfo);console.log("updatechallenge called");

      } catch (error) {
        console.error('Error fetching challenge info:', error);
      }
    };

    fetchInitData();
  }, [chain, pending, updated]);

  // --- Fetch XP token allowance ---
  useEffect(() => {
    const fetchAllowance = async () => {
      try {
        const chainId = chain?.id ?? standardChain;
        const _allowance = await readContract(config, {
          address: getXPTokenAddress(chainId),
          abi: WaveAbi,
          functionName: 'allowance',
          args: [address, getWaveFlipChallengeAddress(chainId)],
          chainId
        });
        setAllowance(_allowance.toString());
      } catch (err) {
        console.error('Allowance fetch failed:', err);
        setAllowance(0);
      }
    };

    if (address) fetchAllowance();

  }, [address, chain, pending]);

  // --- Set newGameId when wager changes ---
  useEffect(() => {
    if (wager && gameMinTokenAmount.length && gameIds.length) {
      const idx = gameMinTokenAmount.findIndex(v => v === wager);
      if (idx !== -1) {
        setNewGameId(gameIds[idx]);
      } else {
        setNewGameId(null);
      }
    } else {
      setNewGameId(null);
    }
  }, [wager, gameMinTokenAmount, gameIds]);

  // --- Handlers ---
  const createChallengeHandler = async () => {
    const chainId = chain?.id ?? standardChain;
    if (!address ) return toast.error('Connect Wallet.');
    if (pending) return toast.error('Please Wait...');
    if (!newGameId) return toast.error('Please select a wager.');

    try {
      const tx = await writeContract(config, {
        address: getWaveFlipChallengeAddress(chainId),
        abi: WaveFlipAbi,
        functionName: 'createChallenge',
        args: [newGameId, BigInt(wager), isHead],
        chainId: chainId,
      });

      setPending(true);
      await waitForTransaction(config, { hash: tx });
      setPending(false);
      toast.success('Challenge created.');
    } catch (err) {
      console.error('Create failed:', err);
      toast.error('Failed to create challenge.');
      setPending(false);
    }
  };

  const enterChallengeHandler = async (challengeId, xpAmount, side) => {
    const chainId = chain?.id ?? standardChain;console.log("accept button test", xpAmount);
    if (!address || pending) return toast.error('Connect wallet or wait.');

    try {
      const tx = await writeContract(config, {
        address: getWaveFlipChallengeAddress(chainId),
        abi: WaveFlipAbi,
        functionName: 'enterChallenge',
        args: [challengeId, xpAmount, side],
        chainId
      });

      setPending(true);
      await waitForTransaction(config, { hash: tx });
      setPending(false);
      toast.success('Challenge joined.');
    } catch (err) {
      console.error('Enter failed:', err);
      toast.error('Failed to enter challenge.');
      setPending(false);
    }
  };

  const cancelChallengerHandler = async (challengeId) => {
    const chainId = chain?.id ?? standardChain;
    if (!address || pending) return toast.error('Connect wallet or wait.');

    try {
      const tx = await writeContract(config, {
        address: getWaveFlipChallengeAddress(chainId),
        abi: WaveFlipAbi,
        functionName: 'cancelChallenge',
        args: [challengeId],
        chainId
      });

      setPending(true);
      await waitForTransaction(config, { hash: tx });
      setPending(false);
      toast.success('Challenge Canceled.');
    } catch (err) {
      console.error('Canceling failed:', err);
      toast.error('Failed to Cancel challenge.');
      setPending(false);
    }
  };

  //--- Approve Handler---
  const approveHandler = async () => {
    const chainId = chain?.id ?? standardChain;
    if (!address || pending) return toast.error('Connect wallet or wait.');

    try {
      const approve = await writeContract(config, {
        address: getXPTokenAddress(chainId),
        abi: WaveAbi,
        functionName: 'approve',
        args: [getWaveFlipChallengeAddress(chainId), BigInt(1_000_000e18)],
        chainId,
        gasLimit: 300_000n
      });

      setPending(true);
      await waitForTransaction(config, { hash: approve });
      setPending(false);
      toast.success('Approve confirmed.');
    } catch (err) {
      console.error('Approve failed:', err);
      toast.error('Failed to approve');
      setPending(false);
    }
  };

  //--- Event Listener---
  useEffect(() => {
    if (!window.ethereum) return;

    const chainId = chain?.id ?? standardChain;
    const provider = new ethers.providers.WebSocketProvider(window.ethereum);
    const contractAddress = getWaveFlipChallengeAddress(chainId);
    const contract = new ethers.Contract(contractAddress, WaveFlipAbi, provider);

    const handler = (
      challengeId,
      player1,
      player2,
      wager,
      result,
      winner,
      time,
      reward,
      event // event object
    ) => {
      setEvents((prev) => [
        {
          player1,
          player2,
          wager: wager.toString(),
          result,
          winner,
          time: time.toString(),
          reward: reward.toString(),
          txHash: event.transactionHash,
        },
        ...prev
      ]);

      setUpdated(updated+1);
      toast.success(`Winner Drawn: ${shortenAddress(winner, 4)}!`);
    };

      function onUpdateChallengs() {
        console.log("Challenge Updated!");
        // setPending(true);
        // setPending(false);
        
        setUpdated(updated+1);
      }

      contract.on("WinnerDrawn", handler);
      contract.on("ChallengeCreated", onUpdateChallengs);
      contract.on("ChallengeCancelled", onUpdateChallengs);

      console.log("event hander registered")
      // Cleanup
      return () => {
        contract.off("WinnerDrawn", handler);
        contract.off("ChallengeCreated", onUpdateChallengs);
        contract.off("ChallengeCancelled", onUpdateChallengs);
      };
    }, [chain]
  );
  

  // --- Render ---
  return (
    <>
      <TopBar />
      {/*Header*/}
      <div className="hero-area pool">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 d-flex align-self-center">
              <div className="left-content">
                <div className="content">
                  <h1 className="title">
                    Flip the Coin, Win Big!
                  </h1>
                  <h3 className='sub-title'>CHALLENGE AND TEST YOUR LUCK.</h3>
                  <p className="text-center">
                    Test your luck with the ultimate coin flip game. Choose your side, place your XP, and see if fortune favors you!
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-img2 d-block d-md-none">
                <img src="assets/images/pools/coinflip.png" alt="" />
              </div>
              <div className="hero-img d-none d-md-block">
                <img className="shape man" src="assets/images/coinflip.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*create challenge*/}
      <section className='prize-pools coinflip activities'>
        <div className="container">
          <div className="row">
            <div className='col-lg-12'>
              <div className='mega-prize-pool'>
                <div className='left'>
                  <img src='assets/images/game/coinflip.gif' alt='' />
                </div>
                <div className='right'>
                  <div className='r-row'>
                    <div className='content'>
                      <h4 className='title'>WAVE FLIP</h4>
                      <p>50/50 chance to win big – pick a side and flip the coin!</p>
                    </div>
                  </div>
                  <div className='r-row mt-3'>
                    <div className='d-flex'>
                      <div className='item'>
                        <div className={isHead ? "count active" : "count"} onClick={() => setIsHead(true)}>
                          <img src="/assets/images/game/head.png" alt="" width={40} />
                          <span>Head</span>
                        </div>
                      </div>
                      <div className='item ml-2'>
                        <div className={!isHead ? "count active" : "count"} onClick={() => setIsHead(false)}>
                          <img src="/assets/images/game/tail.png" alt="" width={40} />
                          <span>Tail</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='r-row mt-3'>
                    <div className='d-flex' style={{flexDirection: 'column'}}>
                        <span>WAGER:</span>
                      <div className='d-flex'>
                        {gameMinTokenAmount.map((value, idx) => (
                          <div className={idx === 0 ? 'item ml-0' : 'item ml-2'} key={value}>
                            <div
                              className={wager === value ? 'count active' : 'count'}
                              onClick={() => setWager(value)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img src="/logo.png" alt="" width={40} />
                              <span>{value / 1e18}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className='r-row'>
                    <div></div>
                    <div className="join-game link" disabled={pending === 1} onClick={() => allowance > BigInt(wager) ? createChallengeHandler() : approveHandler()}> 
                      {allowance > BigInt(wager) ? 'Create Challenge' : 'Approve'}
                      <i className="fas fa-arrow-right" style={{marginLeft: '8px'}}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*pending challenge*/}
      <div className="activities">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="section-heading">
                <h5 className="subtitle">
                  YOUR PENDING CHALLENGES
                </h5>
                <h2 className="title">
                  
                </h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="tab-content">
                <div className="tab-pane fade show active" id="all-bets" role="tabpanel" aria-labelledby="all-bets-tab" >
                  <div className="responsive-table " style={{scrollbarWidth:"none"}}>
                    <table className="table" >
                      <tbody className = "text-center">
                        {historyChallenge.map((h, i) => (h.isActive && h.creator.userAddress === address?(
                          <tr key={h.id||i}>
                            <td >
                              <img src='assets/images/golden_clock.gif' alt='' width={40}/>
                            </td>
                            <td >
                              <img src={h.creator.side ? "/assets/images/game/head.png":"/assets/images/game/tail.png"} alt="" width={40} />
                              <span>{h.creator.side  ? " HEAD" : " TAIL"}</span>
                            </td>
                            <td >
                              <img src="/logo.png" alt="" width={40} />
                              <span>{Number(h.xpAmount) / 1e18}</span>
                            </td>
                            <td>
                              <span>{formatBlockTimestamp(Number(h.createTime))}</span>
                            </td>
                            <td>
                              <div className="count" onClick={() => allowance > h.xpAmount ? cancelChallengerHandler(h.challengeId) : approveHandler()}>
                                <img src='/assets/images/delete.png' width={10}/>
                              </div>
                            </td>
                          </tr>
                        ):null))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*active challenge & leaderboard*/}
      <div className="container" style={{ minHeight: "70vh", overflow: "hidden" }}>
        <div className="row rounded-5 border border-light p-4" style={{minHeight: "50vh", height: "70vh" }}>
          {/* LEFT CHALLENGE CARDS */}
          <div className="col-lg-8  flex-column " style={{maxHeight:"50vh", minHeight:"30vh"}}>
            <div className="fw-bold text-center mb-4" style={{ fontSize: 26, letterSpacing: 1, color: "#fff" ,marginTop:23}}>
              <span>ACTIVE CHALLENGES</span>
            </div>
            <div
              className="col-lg-12 flex-grow-1 d-flex overflow-auto "
              style={{
                maxHeight:"60vh",
                minHeight:"30vh"
              }}>
                <div
                  className="d-flex flex-column flex-grow-1 overflow-auto responsive-table"
                  style={{
                    maxHeight:"50VH",
                    scrollbarWidth:"none"
                  }}>
                  {historyChallenge.filter(h => address!==undefined && h.isActive && h.creator.userAddress !== address).map((h, j) => (
                    <div
                      key={h.id || j}
                      className="rounded-4 border border-warning mb-4 p-4"
                      style={{
                        background: "linear-gradient(135deg, #252c86ff 70%, #222f9eff 100%)",
                        minHeight: 220,
                        color: "#fff",
                        boxShadow: "0 2px 16px rgba(52, 57, 147, 0.15)"
                      }}
                    >
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-4"
                          style={{
                            width: 90,
                            height: 90,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img src="/assets/images/activeChallengeAvatar.png" alt="avatar" style={{ width: 90, height: 90, borderRadius: 16 }} />
                        </div>
                        <div>
                          <div className="fw-bold" style={{ fontSize: "2rem", color: "#ffe872" }}>{shortenAddress(h.creator.userAddress,4)}</div>
                          <div className="fw-bold" style={{ fontSize: "1.4rem" }}>{formatBlockTimestamp(Number(h.createTime))}</div>
                        </div>
                        <div className="ms-auto text-end">
                          <div className="fw-bold" style={{ fontSize: 16 }}>WAGER</div>
                          <div className="d-flex align-items-center rounded-4 px-4 py-2 mt-1" style={{ background: "#494fa9" }}>
                            <img src="/logo.png" alt="Wager" style={{ width: 36, marginRight: 8 }} />
                            <span className="fw-bold" style={{ fontSize: 28, color: "#ffe872" }}><span> {Number(h.xpAmount) / 1e18}</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        {/* Head */}
                        <div
                          className="d-flex align-items-center me-2 px-2 py-2"
                          style={{
                            background: h.creator.side ? "#0d208bff" : "#494fa9",
                            color: h.creator.side ? "#ffe872" : "#fff",
                            border: h.creator.side ? "2px solid #ffe872" : "2px solid #494fa9",
                            borderRadius: "16px",
                            fontSize: 22,
                            opacity: h.creator.side ? 1 : 0.6
                          }}
                        >
                          <img src="/assets/images/game/head.png" alt="head" style={{ width: 28, marginRight: 8 }} />
                          <span>Head</span>
                        </div>
                        {/* Tail */}
                        <div
                          className="count d-flex align-items-center me-3 px-3 py-2"
                          style={{
                            background: !h.creator.side ? "#0d208bff" : "#494fa9",
                            color: !h.creator.side ? "#ffe872" : "#fff",
                            border: !h.creator.side ? "2px solid #ffe872" : "2px solid #494fa9",
                            borderRadius: "16px",
                            fontSize: 22,
                            opacity: !h.creator.side ? 1 : 0.6
                          }}
                        >
                          <img src="/assets/images/game/tail.png" alt="tail" style={{ width: 28, marginRight: 8 }} />
                          <span>Tail</span>
                        </div>
                        {/* Accept Button */}
                        <div
                          className="btn ms-auto px-2 py-2 fw-bold"
                          onClick={() => !pending && allowance > h.xpAmount ? enterChallengeHandler(h.challengeId, h.xpAmount, !h.creator.side) : approveHandler()}
                          style={{
                            background: "linear-gradient(90deg, #ffb742 10%, #82ecfd 100%)",
                            color: "#182365",
                            fontSize: 24,
                            borderRadius: 16,
                            border: 0
                          }}>
                          <span>{allowance > h.xpAmount ? 'ACCEPT' : 'APPROVE'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
              {/* RIGHT LEADERBOARD */}
            <div className="col-12 col-lg-4 p-4 d-flex flex-column mt-4 mt-lg-0" style={{ maxHeight: "67vh"}}>
              <div className="fw-bold text-center mb-4 " style={{ fontSize: 26, letterSpacing: 1, color: "#fff" }}>
                  <span>LEADERBOARD</span>
                </div>
              <div
                className="rounded-4 p-4 flex-column flex-grow-1 overflow-auto responsive-table"
                style={{
                  maxHeight:"60VH",
                  maxWidth:"100%",
                  minWidth:"50%",
                  scrollbarWidth:"none"
                }}>
                  <SocketLeaderboard/>
              </div>
          </div>
        </div>
      </div>

      {/*coin flip history*/}
      <div className="activities">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="section-heading">
                <h5 className="subtitle">
                  
                </h5>
                <h2 className="title">
                  COIN FLIP HISTORY
                </h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <div className="tab-content">
                <div className="tab-pane fade show active" id="all-bets" role="tabpanel" aria-labelledby="all-bets-tab">
                  <div className="responsive-table " style={{scrollbarWidth:"none"}}>
                    <table className="table" >
                      <thead className = " active count text-center" >
                        <tr>
                          <th>
                            <span style={{ color: "#ffffff" }}>PLAYER1</span>
                          </th>
                          <th>
                            <span style={{ color: "#ffffff" }}>PLAYER2</span>
                          </th>
                          <th>
                            <span style={{ color: "#ffffff" }}>WAGER</span>
                          </th>
                          <th>
                            <span style={{ color: "#ffffff" }}>RESULT</span>
                          </th>
                          <th>
                            <span style={{ color: "#ffffff" }}>WINNER</span>
                          </th>
                          <th>
                            <span style={{ color: "#ffffff" }}>DATE / TIME</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className = "text-center active count ">
                        {events.map((e, k) => (
                          <tr key={e.id||k}>
                            <td >
                              {shortenAddress(e.player1,4)}
                            </td>
                            <td >
                              {shortenAddress(e.player2,4)}
                            </td>
                            <td>
                              <img src="/logo.png" alt="" width={40} />
                              {Number(e.wager) / 1e18}
                            </td>
                            <td>
                              <img src={e.result ? "/assets/images/game/head.png":"/assets/images/game/tail.png"} alt="" width={40} />
                              {e.result  ? " HEAD" : " TAIL"}
                            </td>
                            <td >
                              {shortenAddress(e.winner,4)}
                            </td>
                            <td>
                              {formatBlockTimestamp(Number(e.time))}
                            </td>
                          </tr>
                        ))}
                        {coinflipHistory.map((item, idx) => (
                          <tr key={item._id || idx}>
                            <td>
                              {item.winner.role=="creator"?shortenAddress(item.winner.username,4):shortenAddress(item.loser.username,4)}
                            </td>
                            <td>
                              {item.winner.role=="challenger"?shortenAddress(item.winner.username,4):shortenAddress(item.loser.username,4)}
                            </td>
                            <td className='w-full'>
                              <img src="/logo.png" alt="" width={40}/> 
                              {item.amount/1e18}
                            </td>
                            <td>
                              <img src={item.result ? "/assets/images/game/head.png":"/assets/images/game/tail.png"} alt="" width={40} />
                            </td>
                            <td>
                              {shortenAddress(item.winner.username,4)}
                            </td>
                            <td>
                              {formatDatetime(new Date(item.createdAt))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex gap-2 my-2">
                      <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                        Prev
                      </button>
                      <span>
                        Page {page} of {totalPages}
                      </span>
                      <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CoinFlip;
