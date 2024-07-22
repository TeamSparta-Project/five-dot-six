import CamCheck from "@/assets/images/cam_check.svg";
import ChiefImage from "@/assets/images/leader.svg";
import PlayerDieImage from "@/assets/images/player_die.svg";
import useClickHandler from "@/hooks/useClickHandler";
import usePlayerNumber from "@/hooks/usePlayerNumber";
import { useDiedPlayer, useGameState } from "@/store/game-store";
import { useActivePlayer, useIsLocalOverlay, useReadyPlayers } from "@/store/overlay-store";
import S from "@/style/livekit/livekit.module.css";
import {
  ParticipantTile,
  TrackLoop,
  TrackReferenceOrPlaceholder,
  useLocalParticipant
} from "@livekit/components-react";
import Image from "next/image";
import GameStartButton from "./GameStartButton";

const LocalParticipant = ({ tracks }: { tracks: TrackReferenceOrPlaceholder[] }) => {
  const activePlayerId = useActivePlayer();
  const isLocalOverlay = useIsLocalOverlay();
  const { localParticipant } = useLocalParticipant();
  const isGameState = useGameState();
  const playerNumber = usePlayerNumber(localParticipant.identity, isGameState);
  const localReadyState = useReadyPlayers();
  const { clickHandler } = useClickHandler();

  const diedPlayers = useDiedPlayer();
  const isDied = diedPlayers.find((diedPlayer) => diedPlayer === localParticipant.identity);
  const localTracks = tracks.filter((track) => track.participant.sid === localParticipant.sid);

  return (
    <div className={S.localParticipant}>
      <TrackLoop tracks={localTracks}>
        <div
          className={`${S.participantOverlay} ${activePlayerId === localParticipant.identity ? S.active : ""}`}
          onClick={isLocalOverlay ? (e) => clickHandler(e, localParticipant.identity) : undefined}
        >
          <div className={S.chief}>
            <Image src={ChiefImage} alt={localParticipant.identity} />
          </div>
          <div className={S.playerNumber}>1번</div>

          {/* {isGameState === "gameStart" && <p className={S.playerNumber}>{playerNumber}</p>} */}

          <ParticipantTile disableSpeakingIndicator={true} className={isLocalOverlay ? S.localCam : undefined} />

          {!isDied ? (
            <div className={`${S.imageOverlay} ${localReadyState[localParticipant.identity] ? S.active : ""}`}>
              <Image src={CamCheck} alt={localParticipant.identity} />
            </div>
          ) : (
            <div className={S.playerDieOverlay}>
              <Image src={PlayerDieImage} alt={localParticipant.identity} />
            </div>
          )}
        </div>
      </TrackLoop>
      {isGameState === "gameReady" && <GameStartButton isGameState={isGameState} />}
    </div>
  );
};

export default LocalParticipant;
