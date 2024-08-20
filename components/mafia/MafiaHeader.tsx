import MoonIcon from "@/assets/images/moon.svg";
import SunIcon from "@/assets/images/sun.svg";
import SpeakTimer from "@/components/mafia/SpeakTimer";
import { useGameState, useIsDay } from "@/store/game-store";
import { useRoomAction } from "@/store/room-store";
import S from "@/style/livekit/livekit.module.css";
import { socket } from "@/utils/socket/socket";
import { DisconnectButton, useLocalParticipant } from "@livekit/components-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MafiaHeader = () => {
  //NOTE - livekit Hooks
  const localParticipant = useLocalParticipant();
  const roomId = localParticipant.localParticipant.metadata;
  const userId = localParticipant.localParticipant.identity;
  const isLocalCamera = localParticipant.isCameraEnabled;
  const isLocalMicePhone = localParticipant.isMicrophoneEnabled;

  //NOTE - global state
  const isGameState = useGameState();
  const isDay = useIsDay();
  const { setIsEntry } = useRoomAction();

  const [morning, setMorning] = useState(false);
  const [night, setNight] = useState(false);
  const router = useRouter();

  //NOTE - 게임 입장 및 종료 시
  useEffect(() => {
    if (isGameState === "gameReady" || "gameEnd") {
      setMorning(false);
      setNight(false);
    }
  }, [isGameState]);

  //NOTE - 방 나가기 이벤트 헨들러
  const leaveRoom = () => {
    socket.emit("exitRoom", roomId, userId);
    router.back();
    setIsEntry(false);
  };

  //NOTE - 방 입장 후 미디어 비활성화할 시 강제퇴장
  useEffect(() => {
    // 초기 렌더링
    if (!localParticipant.cameraTrack || !localParticipant.microphoneTrack) {
      return;
    }

    if (!isLocalCamera || !isLocalMicePhone) {
      socket.emit("exitRoom", roomId, userId);
      router.back();
      setIsEntry(false);
    }
  }, [isLocalCamera, isLocalMicePhone]);

  //NOTE - 밤, 낮 배경
  useEffect(() => {
    if (isDay === "낮") {
      setMorning(true);
      setNight(false);
      return;
    }

    if (isDay === "밤") {
      setNight(true);
      setMorning(false);
    }
  }, [isDay]);

  //NOTE -  테마
  const dayTime = morning ? S.day : "";
  const nightTime = night ? S.night : "";
  const resultClassName = `${dayTime} ${nightTime}`;

  return (
    <div className={`${S.roomBackground} ${resultClassName}`}>
      <div className={S.goToMainPage}>
        <DisconnectButton onClick={leaveRoom}>
          <span>＜</span> 방 나가기
        </DisconnectButton>
      </div>
      {isGameState === "gameStart" && (
        <div className={S.gameTimer}>
          <SpeakTimer />
          <p className={S.dayAndNight}>
            <span className={S.sun}>{morning && <Image src={SunIcon} className={S.sunImage} alt="sun icon" />}</span>
            <span className={S.moon}>{night && <Image src={MoonIcon} className={S.moonImage} alt="moon icon" />}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MafiaHeader;
