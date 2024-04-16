"use client";

import useConnectStore from "@/store/connect-store";
import S from "@/style/livekit/livekit.module.css";
import { socket } from "@/utils/socket/socket";
import "@livekit/components-styles";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";

const PreJoinNoSSR = dynamic(
  async () => {
    return (await import("@livekit/components-react")).PreJoin;
  },
  { ssr: false }
);

const RoomLayout = ({ children }: PropsWithChildren) => {
  const [isJoin, setIsJoin] = useState(false);
  const { roomId, userId, nickname } = useConnectStore();

  useEffect(() => {
    //NOTE - 방 입장
    socket.on("joinRoom", () => {
      setIsJoin(true);
    });

    socket.on("joinRoomError", (message) => {
      alert(message);
      return () => redirect("/main");
    });

    return () => {
      socket.off("joinRoom");
      socket.off("joinRoomError");
    };
  }, [roomId]);

  const joinRoomHandler = () => {
    socket.emit("joinRoom", userId, roomId, nickname);
  };

  return (
    <>
      <main data-lk-theme="default">
        {isJoin ? (
          children
        ) : (
          <section className={S.settingWrapper}>
            <h2>오디오 & 캠 설정 창 입니다.</h2>
            <div className={S.settingCam}>
              <PreJoinNoSSR
                onError={(err) => console.log("setting error", err)}
                defaults={{
                  username: "",
                  videoEnabled: true,
                  audioEnabled: true
                }}
                joinLabel="입장하기"
                onSubmit={joinRoomHandler}
                onValidate={() => true}
              ></PreJoinNoSSR>
              <div className={S.settingUserButton}>
                <ul>
                  <li>오디오 설정 확인</li>
                  <li>캠 설정 확인</li>
                </ul>
              </div>
              <div className={S.cover}></div>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default RoomLayout;
