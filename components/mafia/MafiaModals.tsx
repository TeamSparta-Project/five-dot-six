import useSocketOn from "@/hooks/useSocketOn";
import { useCurrentModal, useModalActions, useModalIsOpen } from "@/store/show-modal-store";
import { Role, VoteResult, YesOrNoResults } from "@/types";
import CheckModal from "@/components/modal/CheckModal";
import GroupMafiaModal from "@/components/modal/GroupMafiaModal";
import LastVoteResultModal from "@/components/modal/LastVoteResultModal";
import UserRoleModal from "@/components/modal/UserRoleModal";
import VictoryModal from "@/components/modal/VictoryModal";
import VoteResultModal from "@/components/modal/VoteResultModal";
import { useGameActions } from "@/store/game-store";

const MafiaModals = () => {
  //NOTE - global state
  const isOpen = useModalIsOpen();
  const currentModal = useCurrentModal();
  const { setIsDay } = useGameActions();
  const { setYesOrNoVoteResult, setCurrentModal, setIsOpen, setTimer, setTitle, setRole, setVoteResult } =
    useModalActions();

  const sockets = {
    showModal: (title: string, timer: number) => {
      //NOTE -  CheckModal(찬성/반대) 투표 모달창 요소
      if (title.includes("찬성/반대 투표")) {
        setCurrentModal("CheckModal");
        setIsOpen(true);
        setTitle(title);
        setTimer(timer);
        return;
      }

      if (title.includes("아침")) {
        setIsDay("낮");
      }

      if (title.includes("밤")) {
        setIsDay("밤");
      }

      //NOTE - GroupModal 모달창 요소
      setCurrentModal("GroupMafiaModal");
      setIsOpen(true);
      setTitle(title);
      setTimer(timer);
    },

    //NOTE - UserRoleModal 모달창 요소
    showAllPlayerRole: (role: Role, timer: number) => {
      setCurrentModal("UserRoleModal");
      setIsOpen(true);
      setRole(role);
      setTimer(timer);
    },
    //NOTE - 투표 결과 모달창 요소
    showVoteResult: (voteResult: VoteResult[], timer: number) => {
      setCurrentModal("VoteResultModal");
      setIsOpen(true);
      setVoteResult(voteResult);
      setTimer(timer);
    },
    //NOTE - 찬성/반대 투표 결과 모달창 요소
    showVoteDeadOrLive: (voteResult: YesOrNoResults, timer: number) => {
      setCurrentModal("LastVoteResultModal");
      setIsOpen(true);
      setYesOrNoVoteResult(voteResult);
      setTimer(timer);
    },
    //NOTE - 승리한 팀 모달창 요소
    victoryPlayer: (victoryTeam: string, timer: number) => {
      setCurrentModal("VictoryModal");
      setIsOpen(true);
      setTitle(victoryTeam);
      setTimer(timer);
    }
  };

  //NOTE - socket On, Off 담당
  useSocketOn(sockets);

  if (!isOpen) return null;

  switch (currentModal) {
    case "GroupMafiaModal":
      return <GroupMafiaModal />;
    case "UserRoleModal":
      return <UserRoleModal />;
    case "CheckModal":
      return <CheckModal />;
    case "VoteResultModal":
      return <VoteResultModal />;
    case "LastVoteResultModal":
      return <LastVoteResultModal />;
    case "VictoryModal":
      return <VictoryModal />;
    default:
      return null;
  }
};

export default MafiaModals;
