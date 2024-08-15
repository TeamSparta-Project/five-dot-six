import MafiaPlayRooms from "@/components/mafia/MafiaPlayRooms";
import useBeforeUnloadHandler from "@/hooks/useBeforeUnloadHandler";
import usePopStateHandler from "@/hooks/usePopStateHandler";
import { useRoomAction } from "@/store/room-store";
import Style from "@/style/commons/commons.module.css";
import S from "@/style/livekit/livekit.module.css";
import { getToken } from "@/utils/livekit/liveKitApi";
import { socket } from "@/utils/socket/socket";
import { LiveKitRoom, PreJoin } from "@livekit/components-react";
import "@livekit/components-styles";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import MediaError from "@/assets/images/media_error.svg";
import SorryImage from "@/assets/images/sorry_image.avif";
import Image from "next/image";
import { checkUserLogIn } from "@/utils/supabase/authAPI";

const JoinMafiaRoom = () => {
  const roomId = useParams();
  const [userInfo, setUserInfo] = useState({
    userId: "",
    nickname: ""
  });
  const [token, setToken] = useState("");
  const [isMediaError, setIsMediaError] = useState(false);
  const [isTokenError, setIsTokenError] = useState(false);
  const [isJoin, setIsJoin] = useState(false);
  const isPopState = usePopStateHandler();
  const { setIsEntry } = useRoomAction();
  const { setIsReLoad } = useBeforeUnloadHandler();

  //NOTE - 뒤로가기 시 작동
  useEffect(() => {
    if (isPopState) {
      socket.emit("exitRoom", roomId.id, userInfo.userId);
      setIsEntry(false);
    }
  }, [isPopState]);

  //NOTE - 로그인 정보
  useEffect(() => {
    const checkUserInfo = async () => {
      try {
        const loginInfo = await checkUserLogIn();
        if (loginInfo) {
          const nickname = loginInfo.user_metadata.nickname || loginInfo.user_metadata.name;
          setUserInfo({ userId: loginInfo.id, nickname });
        }
      } catch (error) {
        joinErrorHandler(error);
      }
    };

    checkUserInfo();
  }, []);

  //NOTE - 토큰 발급
  useEffect(() => {
    const userToken = async () => {
      try {
        const token = await getToken(roomId.id, userInfo.userId, userInfo.nickname);

        if (token) {
          setToken(token);
        }
      } catch (error) {
        setIsTokenError(true);
      }
    };

    // 로그인 정보 존재 시
    if (userInfo.userId && userInfo.nickname) {
      userToken();
    }
  }, [userInfo]);

  //NOTE - 방입장 이벤트
  const joinRoomHandler = () => {
    setIsReLoad(true); //새로고침 팝업창 on, off
    setIsJoin(true); //방 입장
  };

  //NOTE - 에러 이벤트 핸들러(로그인, 토큰, 방입장 등)
  const joinErrorHandler = (error: Error | string | unknown) => {
    console.log("error", error);
    setIsMediaError(true);
  };

  //NOTE - 토큰 에러 UI
  if (isTokenError) {
    return (
      <section className={Style.mainSection}>
        <Image src={SorryImage} alt="sorry image" />
        <h2>게임 접속에 불편을 드려서 죄송합니다.</h2>
        <h3>
          현재 원활한 게임이 진행되지 않고 있으니, <br />
          다시 접속해 주시기 바랍니다.
        </h3>
        <button
          onClick={() => {
            socket.emit("exitRoom", roomId.id, userInfo.userId);
            setIsEntry(false);
          }}
        >
          메인페이지로 이동하기
        </button>
      </section>
    );
  }

  //NOTE - 미디어 권한 에러 UI
  if (isMediaError) {
    return (
      <section className={Style.mainSection}>
        <Image
          className={Style.mediaInfoImage}
          src={MediaError}
          alt="카메라, 마이크를 활성화 시켜주세요"
          width={686}
          height={452}
        />
        <h2 className={Style.mediaError}>게임 접속에 불편을 드려서 죄송합니다.</h2>
        <h3>마이크 및 카메라 권한 설정을 확인 후 진행해 주세요.</h3>
        <button
          onClick={() => {
            socket.emit("exitRoom", roomId.id, userInfo.userId);
            setIsEntry(false);
          }}
        >
          메인페이지로 이동하기
        </button>
      </section>
    );
  }

  return (
    <main data-lk-theme="default">
      {isJoin ? (
        <>
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            video={true}
            audio={true}
            onError={joinErrorHandler}
            connect={true}
          >
            <MafiaPlayRooms />
          </LiveKitRoom>
        </>
      ) : (
        <section className={S.settingWrapper}>
          <h2>오디오 & 캠 설정 창 입니다.</h2>
          <div className={S.settingCam}>
            <PreJoin
              onError={(error) => {
                joinErrorHandler;
                console.log(error);
              }}
              joinLabel="입장하기"
              onSubmit={joinRoomHandler}
              onValidate={() => !isMediaError || !isTokenError}
            ></PreJoin>
            <div className={S.settingUserButton}>
              <ul>
                <li>오디오 설정 </li>
                <li>캠 설정 </li>
              </ul>
            </div>
            <div className={S.cover}></div>
          </div>
        </section>
      )}
    </main>
  );
};

export default JoinMafiaRoom;
