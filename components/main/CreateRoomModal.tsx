import MafiaGameChoice from "@/assets/images/game_choice_mafia.svg";
import MafiaGameChoiceActive from "@/assets/images/game_choice_mafia_active.svg";
import MafiaGameSong from "@/assets/images/game_choice_song.svg";
import MafiaGameSongActive from "@/assets/images/game_choice_song_active.png.svg";
import useSocketOn from "@/hooks/useSocketOn";
import { useConnectActions, useNickname, useUserId } from "@/store/connect-store";
import { useRoomAction } from "@/store/room-store";
import S from "@/style/modal/modal.module.css";
import { CreateRoomModalProps, CreateRooms } from "@/types";
import { socket } from "@/utils/socket/socket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { FormEvent, useRef, useState } from "react";
import { toast } from "react-toastify";

const CreateRoomModal = ({ setIsCreate, closeModal }: CreateRoomModalProps) => {
  const router = useRouter();
  const isGoInClick = useRef(false);
  const roomIdRef = useRef<string>("");
  const [roomTitle, setRoomTitle] = useState("");
  const [selectedGame, setSelectedGame] = useState("마피아");
  const [numberOfPlayers, setNumberOfPlayers] = useState(5);

  const userId = useUserId();
  const nickname = useNickname();
  const { setIsEntry } = useRoomAction();
  const { setRoomId } = useConnectActions();

  const createSocket = {
    createRoom: ({ room_id }: CreateRooms) => {
      roomIdRef.current = room_id;
      socket.emit("joinRoom", userId, roomIdRef.current, nickname);
    },
    createRoomError: (message: string) => {
      toast.error(message);
      isGoInClick.current = false;
    },
    joinRoom: () => {
      if (roomIdRef.current && selectedGame === "마피아") {
        setRoomId(roomIdRef.current);
        setIsCreate(false);
        setIsEntry(true);
        router.push(`/room/${roomIdRef.current}/`);
      }
    },
    joinRoomError: (message: string) => {
      toast.error(message);
      isGoInClick.current = false;
    }
  };
  useSocketOn(createSocket);

  const gameSelectHandler = (game: string) => {
    setSelectedGame(game);
    setRoomTitle("");
  };

  //NOTE - 방 만들기 핸들러
  const createRoomSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!userId && !nickname) {
        toast.info("로그인 후 게임을 이용해 주세요.");
        return;
      }
      if (!roomTitle.trim()) {
        toast.error("방 제목을 입력해 주세요.");
        return;
      }
      if (!isGoInClick.current && selectedGame === "마피아") {
        isGoInClick.current = true;
        socket.emit("createRoom", roomTitle, selectedGame, numberOfPlayers);
        setSelectedGame("마피아");
        setRoomTitle("");
        setNumberOfPlayers(5);
        return;
      }
      if (!isGoInClick.current && selectedGame === "노래맞추기") {
        toast("노래 맞추기 게임은 준비중입니다.");
        return;
      }
    } catch (error) {}
  };

  const playerOptions = Array.from({ length: 6 }, (_, i) => i + 5);

  return (
    <div className={S.modalWrap} onClick={closeModal}>
      <div className={S.mainModal}>
        <button className={S.closeButton} onClick={closeModal}>
          &times;
        </button>
        <form onSubmit={createRoomSubmitHandler} className={S.gameForm}>
          <h2 className={S.gameChoice}>게임을 선택해 주세요</h2>
          <div>
            <h3 className={S.gameTitle}>게임 고르기</h3>
            <ul className={S.gameChoiceList}>
              <li onClick={() => gameSelectHandler("마피아")}>
                <Image src={selectedGame === "마피아" ? MafiaGameChoiceActive : MafiaGameChoice} alt="마피아 게임" />
              </li>
              <li onClick={() => gameSelectHandler("노래맞추기")}>
                <Image
                  src={selectedGame === "노래맞추기" ? MafiaGameSongActive : MafiaGameSong}
                  alt="노래 맞추기 게임"
                />
              </li>
            </ul>
          </div>
          <div className={S.gameNameText}>
            <h3 className={S.gameTitle}>방 제목</h3>
            <input
              type="text"
              id="RoomName"
              value={roomTitle}
              placeholder="방 제목을 입력해 주세요."
              onChange={(e) => setRoomTitle(e.target.value)}
              maxLength={16}
              autoFocus
            />
          </div>
          {selectedGame === "마피아" ? (
            <div className={S.playerPeopleChoice}>
              <h3 className={S.gameTitle}>인원수</h3>
              <select value={numberOfPlayers} onChange={(e) => setNumberOfPlayers(Number(e.target.value))}>
                {playerOptions.map((number) => (
                  <option key={number} value={number}>
                    {number}명
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className={S.gameChoiceButton}>
            <button className={S.closedButton} type="button" onClick={closeModal}>
              닫기
            </button>
            <button disabled={isGoInClick.current} type="submit">
              확인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
