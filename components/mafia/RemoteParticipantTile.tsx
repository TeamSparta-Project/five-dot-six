import PlayerDieImages from "@/assets/images/player_die.svg";
import useClickHandler from "@/hooks/useClickHandler";
import usePlayerNumber from "@/hooks/usePlayerNumber";
import { useDiedPlayer, useGameState } from "@/store/game-store";
import { useActivePlayer, useIsRemoteOverlay, useJobImageState, useReadyPlayers } from "@/store/overlay-store";
import S from "@/style/livekit/livekit.module.css";
import { ParticipantTile, ParticipantTileProps, useEnsureTrackRef } from "@livekit/components-react";
import Image from "next/image";
import CamCheck from "@/assets/images/cam_check.svg";

const RemoteParticipantTile = ({ trackRef }: ParticipantTileProps) => {
  const remote = useEnsureTrackRef(trackRef);
  const activePlayerId = useActivePlayer();
  const diedPlayers = useDiedPlayer();
  const imageState = useJobImageState();
  const isGameState = useGameState();
  const playerNumber = usePlayerNumber(remote.participant.identity, isGameState);
  const isRemoteOverlay = useIsRemoteOverlay();

  const remoteReadyStates = useReadyPlayers();
  const { clickHandler } = useClickHandler();

  const diedPlayer = diedPlayers.find((diedPlayer) => diedPlayer === remote.participant.identity);

  return (
    <>
      <li
        className={`${S.remoteParticipantOverlay} ${activePlayerId === remote.participant.identity ? S.active : ""}`}
        onClick={isRemoteOverlay && !diedPlayer ? (e) => clickHandler(e, remote.participant.identity) : undefined}
      >
        <ParticipantTile
          disableSpeakingIndicator={true}
          className={`${S.remoteCam} ${isRemoteOverlay && !diedPlayer ? "cursor-pointer" : ""}`}
        />
        {isGameState === "gameStart" && <p className={S.playerNumber}>{playerNumber}번</p>}
        {!diedPlayer ? (
          <div className={`${S.remoteOverlay} ${remoteReadyStates[remote.participant.identity] ? S.active : ""}`}>
            <Image src={imageState || CamCheck} alt={remote.participant.identity} />
          </div>
        ) : (
          <div className={S.playerDieOverlay}>
            <Image src={PlayerDieImages} alt={remote.participant.identity} />
          </div>
        )}
      </li>
    </>
  );
};

export default RemoteParticipantTile;
