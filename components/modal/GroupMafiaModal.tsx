import { useGroupModalElement } from "@/store/show-modal-store";
import S from "@/style/modal/modal.module.css";
import ModalProgress from "@/utils/ModalProgress";

const GroupMafiaModal = () => {
  const title = useGroupModalElement();
  const gunsound = [];

  return (
    <>
      <div className={S.modalWrap}>
        <div className={S.modal}>
          <div>
            {title && <h1>{title}</h1>}
            <ModalProgress />
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupMafiaModal;
