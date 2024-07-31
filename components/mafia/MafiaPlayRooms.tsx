import useMediaDevice from "@/hooks/useMediaDevice";
import useSelectSocket from "@/hooks/useSelectSocket";
import useSocketOn from "@/hooks/useSocketOn";
import { pretendard } from "@/public/fonts/fonts";
import { useGameActions, useGameState } from "@/store/game-store";
import { useOverLayActions } from "@/store/overlay-store";
import { useModalActions } from "@/store/show-modal-store";
import S from "@/style/livekit/livekit.module.css";
import { MediaStatus, playersInfo } from "@/types";
import { allAudioSetting } from "@/utils/participantCamSettings/camSetting";
import { RoomAudioRenderer, useLocalParticipant, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useRef } from "react";
import MafiaHeader from "./MafiaHeader";
import LocalParticipant from "./LocalParticipant";
import MafiaModals from "./MafiaModals";
import MafiaToolTip from "./MafiaToolTip";
import RemoteParticipant from "./RemoteParticipant";
import { socket } from "@/utils/socket/socket";

const MafiaPlayRooms = () => {
  const hasEmitted = useRef(false);

  const localParticipant = useLocalParticipant();
  const isGameState = useGameState();
  const { setDiedPlayer, setIsGameState, setGameReset } = useGameActions();
  const { setReadyPlayers, setOverlayReset } = useOverLayActions();
  const { setModalReset } = useModalActions();
  const { setIsMediaReset, setPlayersMediaStatus } = useMediaDevice(); // 카메라 및 오디오 처리
  useSelectSocket(); // 클릭 이벤트 처리

  //NOTE - 방 입장 시 초기화
  useEffect(() => {
    setOverlayReset(); //Local,Remote 클릭 이벤트 및 캠 이미지 초기화
    setModalReset(); //전체 모달 요소 초기화
    setGameReset(); // 죽은 players 및 게임 state 초기화
  }, []);

  //NOTE - 방 입장 시 방의 정보를 불러온다.
  useEffect(() => {
    if (localParticipant.localParticipant.metadata && !hasEmitted.current) {
      const roomId = localParticipant.localParticipant.metadata;

      socket.emit("usersInfo", roomId);
      hasEmitted.current = true;
    }
  }, [localParticipant]);

  const sockets = {
    //NOTE - 전체 players의 실시간 Ready 상태
    setReady: (playerId: string, isReady: boolean) => {
      setReadyPlayers(playerId, isReady);
    },
    //NOTE - 게임 시작
    gameStart: () => {
      setIsGameState("gameStart");
      setOverlayReset(); //local, remote "Ready" 이미지 초기화
    },
    //NOTE - players 미디어 관리
    playerMediaStatus: (playersMedias: MediaStatus) => {
      setPlayersMediaStatus(playersMedias);
    },
    //NOTE - 죽은 player 관리
    diedPlayer: (playerId: string) => {
      setDiedPlayer(playerId);
    },
    //NOTE - 방의 변화를 감지
    updateRoomInfo: (roomInfo: any) => {
      console.log("roomInfo", roomInfo);
    },
    //NOTE - players의 초기 Ready 상태
    usersInfo: (players: playersInfo[]) => {
      players.forEach((player) => {
        setReadyPlayers(player.user_id, player.is_ready);
      });
    },
    //NOTE - Error 처리
    playError: (roomName: string, error: string) => {
      console.log("roomName", roomName);
      console.log("roomError", error);

      setOverlayReset(); //Local,Remote 클릭 이벤트 및 캠 이미지 초기화
      setModalReset(); //전체 모달 요소 초기화
      setGameReset(); // 죽은 players 및 게임 state 초기화
      setIsMediaReset(true); // 캠 및 오디오 초기화
    }
  };
  useSocketOn(sockets);

  //NOTE - 게임 종료
  useEffect(() => {
    if (isGameState === "gameEnd") {
      setOverlayReset(); //Local,Remote 클릭 이벤트 및 캠 이미지 초기화
      setModalReset(); //전체 모달 요소 초기화
      setGameReset(); // 죽은 players 및 게임 state 초기화
      setIsMediaReset(true); // 캠 및 오디오 초기화

      //점수 산정
    }
  }, [isGameState]);

  return (
    <section className={`${S.mafiaPlayRoomWrapper} ${pretendard.className}`}>
      <div className={S.goToMainPage}></div>
      {/* <button
        onClick={() => {
          allAudioSetting(tracks, false);
        }}
        style={{ background: "red" }}
      >
        전체 소리 끄기
      </button> */}
      <MafiaHeader />
      <div className={S.mafiaPlayRoomSection}>
        <LocalParticipant />
        <RemoteParticipant />
        <RoomAudioRenderer muted={false} /> {/* 원격 참가자 오디오 트랙 처리 및 관리 */}
        <MafiaToolTip />
        <MafiaModals />
      </div>
    </section>
  );
};

export default MafiaPlayRooms;
