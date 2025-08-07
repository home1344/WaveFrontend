import { useEffect, useState } from "react";
import socket from "./socket.jsx";

export default function useSocketLeaderboard(apiUrl = "/api/leaderboard") {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch from REST API
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Handler reference for cleanup
    const handleUpdate = (data) => {
      setLeaderboard(data);
    };

    socket.on("leaderboardUpdate", handleUpdate);

    return () => {
      socket.off("leaderboardUpdate", handleUpdate);
    };
  }, [apiUrl]);

  return { leaderboard, loading };
}
