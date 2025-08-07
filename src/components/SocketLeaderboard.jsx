import React from "react";
import useSocketLeaderboard from "./useSocketLeaderboard"; 
import { shortenAddress } from '../utils/constants.ts';

function SocketLeaderboard() {
  const { leaderboard, loading } = useSocketLeaderboard();
  if (loading) return <p>Loading leaderboard...</p>;

  return (

    <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0, color: "#fff" }}>
      {leaderboard.map((entry, index) => (
        <div
          className="d-flex align-items-center py-2 px-2 border-bottom border-dark"
          style={{ fontSize: 18 }}
          key={entry.id||index}
        >
          <img src="/assets/images/avatar.png" alt="avatar" style={{ width: 48, borderRadius: "50%", marginRight: 14 }} />
          <div className="flex-grow-1">{shortenAddress(entry._id, 4)}</div>
          <img src="/logo.png" alt="wave" style={{ width: 28, marginRight: 6 }} />
          <span style={{ color: "#ffe872", fontWeight: "bold" }}>{(entry.totalReward - entry.totalXP)/1e18}</span>
        </div>
      ))}
    </div>
    
  );
}

export default SocketLeaderboard;
/*{
      totalReward
      : 
      180000000000000000000
      totalXP
      : 
      100000000000000000000
      wins
      : 
      2
      _id
      : 
      "0xc44dc8045cfF8278d401C70215F13bd353147dC3"
 } */