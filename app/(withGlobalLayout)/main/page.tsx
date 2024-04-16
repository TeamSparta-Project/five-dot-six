"use client";
import PeopleIcon from "@/assets/images/icon_person.svg";
import MafiaGameTitle from "@/assets/images/mafia_game_title.svg";
import MafiaItem from "@/assets/images/mafia_item.png";
import S from "@/style/mainPage/main.module.css";
import { socket } from "@/utils/socket/socket";
import { checkUserLogIn, getUserInfo, getUserUid, logOut } from "@/utils/supabase/authAPI";
import { fastJoinRoom, getRooms } from "@/utils/supabase/roomAPI";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainCreateRoom from "../../../components/mainpageComponents/MainCreateRoom";
import { useModalStore } from "../../../store/toggle-store";
import useConnectStore from "@/store/connect-store";

const Mainpage = () => {
  const { isModal, setIsModal } = useModalStore();
  const [rooms, setRooms] = useState<any>([]); //데이터베이스 타입을 몰라요
  const { setRoomId, setUserId, setUserNickname } = useConnectStore();

  const router = useRouter();

  useEffect(() => {
    //NOTE -  서버와 연결
    socket.connect();

    //NOTE - 방 목록
    const getRoomList = async () => {
      try {
        const data = await getRooms(0, 7);
        setRooms(data);
      } catch (error) {
        console.log(error);
      }
    };

    getRoomList();
  }, []);

  //NOTE - 입장하기
  // 1. 로그인 여부 확인
  // 2. 입장 하기 버튼 클릭 시 해당 방으로 이동
  const joinRoomHandler = async (item: any) => {
    const isLogin = await checkUserLogIn();
    const userInfo = await getUserInfo();

    if (!isLogin || !userInfo) {
      alert("로그인 후 입장 가능합니다.");
      router.push("/login");
      return;
    }

    setRoomId(item.room_id);
    setUserId(userInfo.id);
    setUserNickname(userInfo.user_metadata.nickname);
    router.push(`/room/${item.room_id}`);
  };

  //NOTE - 빠른 입장
  const fastJoinRoomHandler = async () => {
    try {
      const data = await getUserInfo();
      let nickname;
      let userId;
      if (data) {
        nickname = data.user_metadata.nickname;
        userId = data.id;
      } else {
        console.log("유저 정보 불러오기 실패");
      }
      const roomData = await fastJoinRoom(userId!, nickname);
      console.log("Joined Room Data:", roomData);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  return (
    <main className={S.main}>
      <section className={S.visualSection}>
        <div>
          <ul className={S.gameList}>
            <li className={S.mafiaImage}>
              <div className={S.gameTitle}>
                <h2>
                  <Image src={MafiaGameTitle} alt="mafia game title" />
                </h2>
                <div className={S.gameButton}>
                  <button>Game Start</button>
                  <button className={S.mafiaInfo}>More Info</button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>
      <div className={S.roomSectionWrap}>
        <section className={S.roomSection}>
          <div className={S.MainGnb}>
            <p>현재 활성화 되어있는 방</p>
            <div className={S.roomSearchAndButton}>
              <div className={S.roomSearch}>
                <label htmlFor="RoomSearch">방 검색하기</label>
                <input type="text" id="RoomSearch" placeholder="방 이름을 입력해 주세요." />
              </div>
              <div className={S.gameGoButton}>
                <button onClick={fastJoinRoomHandler}>빠른입장</button>
                <div className={S.makeRoomButton}>
                  <button onClick={() => setIsModal(true)} className={S.makeRoom}>
                    방 만들기
                  </button>
                </div>
                {isModal ? <MainCreateRoom /> : null}
              </div>
            </div>
          </div>
          <ul className={S.roomList}>
            {rooms.map((item: any) => (
              <li key={item.room_id}>
                <Image src={MafiaItem} alt="room image" />
                <div className={S.roomTitle}>
                  <h3>{item.title}</h3>
                  <div className={S.gameName}>
                    <p className={S.mafiaHashtag}>#&nbsp;{item.game_category}</p>
                    <p className={S.currentPeople}>
                      <Image src={PeopleIcon} alt="people icon" />
                      <span>
                        {item.current_user_count}/{item.total_user_count}
                      </span>
                    </p>
                  </div>
                </div>
                <button onClick={() => joinRoomHandler(item)} className={S.gotoButton}>
                  입장하기
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default Mainpage;
