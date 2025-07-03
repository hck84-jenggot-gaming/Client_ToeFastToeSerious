import { useNavigate } from "react-router-dom";
import LeaderboardComponent from "../components/Leaderboard/Leaderboard";

const Leaderboard = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return <LeaderboardComponent onBack={handleBack} />;
};

export default Leaderboard;
