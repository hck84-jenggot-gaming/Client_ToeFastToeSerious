import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const Home = () => {
  const navigate = useNavigate();

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  const handlePlayOnline = async () => {
    const result = await takePlayerName();

    if (!result.isConfirmed) {
      return;
    }

    const username = result.value;

    // Navigate to waiting room with player name
    navigate("/waiting", { state: { playerName: username } });
  };

  const handleViewLeaderboard = () => {
    navigate("/leaderboard");
  };

  return (
    <>
      <h1 className="game-heading">Tic Tac Toe Online</h1>
      <button onClick={handlePlayOnline} className="playOnline">
        Play Online
      </button>
      <button onClick={handleViewLeaderboard} className="playOnline">
        View Leaderboard
      </button>
    </>
  );
};

export default Home;
