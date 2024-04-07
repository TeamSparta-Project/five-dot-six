export const gamePlay = () => {
  playerCount = 8; //NOTE - 방 유저 정원 8명 결정
  const moderator = new Moderator(playerCount); //NOTE - 사회자 생성

  mafiaCount = moderator.roomComposition.mafiaCount; //NOTE - 마피아 플레이어 수

  //NOTE - 플레이어들 게임 참가
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    moderator.players[playerIndex] = new Citizen(`${playerIndex}-${playerIndex}-${playerIndex}`, "user" + playerIndex);
  }

  //NOTE - 모든 플레이어들이 레디함
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    moderator.players[playerIndex].ready(true);
  }

  const isAllPlayerEnoughCount = moderator.checkPlayerCountEnough(); //NOTE - 플레이어들이 방 정원을 채웠는지
  const isAllPlayersReady = moderator.checkAllPlayersReady(); //NOTE - 플레이어들이 전부 레디했는지

  if (
    moderator.canGameStart(isAllPlayerEnoughCount, isAllPlayersReady) //NOTE - 게임이 시작 가능한 상태인지 확인
  ) {
    moderator.gameStart(); //NOTE - 게임 시작
  } else {
    console.log("게임 시작 불가"); //NOTE - 게임 시작 조건 못 갖춤
  }

  moderator.roundStart();

  //NOTE - 모든 참가자들은 역할을 배정받고 플레이어로 변경 (매개 변수가 participant라서 이렇게 대처, 클래스면 게임 순서대로 구현 가능)
  moderator.nightStart(); //NOTE - 밤이 시작됨

  //NOTE - 모든 플레이어들의 카메라와 마이크 끔
  moderator.players.forEach((clientPlayer) =>
    moderator.players.forEach((player) => {
      moderator.turnOffCamera(clientPlayer, player);
      moderator.turnOffMike(clientPlayer, player);
    })
  );

  //NOTE - 플레이어들을 무작위로 섞음
  moderator.shufflePlayers();

  //NOTE - 모든 유저들 작업
  moderator.players.forEach((player) => moderator.speak(player, "마피아를 뽑겠습니다."));

  //NOTE - 마피아 인원 수만큼 플레이어들에게 마피아 역할 배정
  for (let playerIndex = 0; playerIndex < mafiaCount; playerIndex++) {
    randomPlayer = moderator.players[playerIndex]; //NOTE - 랜덤으로 플레이어 선택
    moderator.players[playerIndex] = new Mafia(randomPlayer); //NOTE - 플레이어들의 역할으 마피아로 지정
  }

  moderator.setRoles();
  mafiaPlayers = moderator.roles["마피아"];

  //NOTE - 마피아 유저들에게 자신이 마피아인 것을 알리고 마피아인 유저가 누구인지 공개
  mafiaPlayers.forEach((clientPlayer) =>
    mafiaPlayers.forEach((rolePlayer) => moderator.openPlayerRole(clientPlayer, rolePlayer, "마피아"))
  );

  moderator.players.forEach((player) => moderator.speak(player, "마피아 들은 고개를 들어 서로를 확인해 주세요."));

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 켬
  mafiaPlayers.forEach((clientPlayer) =>
    mafiaPlayers.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    })
  );

  moderator.startTimer(90); //NOTE - 시간 재기

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  mafiaPlayers.forEach((clientPlayer) =>
    mafiaPlayers.forEach((player) => {
      moderator.turnOffCamera(clientPlayer, player);
      moderator.turnOffMike(clientPlayer, player);
    })
  );

  moderator.players.forEach((player) => moderator.speak(player, "의사를 뽑겠습니다."));

  randomPlayer = moderator.players[mafiaCount]; //NOTE - 랜덤으로 플레이어 선택
  moderator.players[mafiaCount] = new Doctor(randomPlayer); //NOTE - 참가자를 의사 플레이어로 설정

  moderator.setRoles();
  doctorPlayer = moderator.roles["의사"];

  moderator.openPlayerRole(doctorPlayer, doctorPlayer, "의사"); //NOTE - 의사 플레이어의 화면에서 자신이 의사임을 알림

  moderator.players.forEach((player) => moderator.speak(player, "경찰을 뽑겠습니다."));

  randomPlayer = moderator.players[mafiaCount + 1]; //NOTE - 랜덤으로 플레이어 선택
  moderator.players[mafiaCount + 1] = new Police(randomPlayer); //NOTE - 참가자를 경찰 플레이어로 설정

  moderator.setRoles();
  policePlayer = moderator.roles["경찰"];

  moderator.openPlayerRole(policePlayer, policePlayer, "경찰"); //NOTE - 경찰 플레이어의 화면에서 자신이 경찰임을 알림

  citizenPlayers = moderator.roles["시민"];

  //NOTE - 시민 플레이어의 화면에서 자신이 시민임을 알림
  citizenPlayers.forEach((citizenPlayer) => moderator.openPlayerRole(citizenPlayer, citizenPlayer, "시민"));

  moderator.nightOver(); //NOTE - 밤 종료
  moderator.roundOver(); //NOTE - 라운드 종료

  moderator.roundStart(); //NOTE - 라운드 시작
  moderator.morningStart(); //NOTE - 아침 시작

  //NOTE - 모든 플레이어들의 화면과 마이크 켬
  moderator.players.forEach((clientPlayer) =>
    moderator.players.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    })
  );

  moderator.players.forEach((player) => moderator.speak(player, "모든 유저는 토론을 통해 마피아를 찾아내세요."));

  moderator.startTimer(90); //NOTE - 시간 재기

  moderator.players.forEach((player) => moderator.speak(player, "토론이 끝났습니다."));

  moderator.players.forEach((player) => moderator.speak(player, "마피아일 것 같은 사람의 화면을 클릭해주세요."));

  moderator.players[0].voteToPlayer(moderator.players[1]); //NOTE - 0번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[1].voteToPlayer(moderator.players[2]); //NOTE - 1번 인덱스 플레이어가 2번 인덱스 플레이어에게 투표
  moderator.players[2].voteToPlayer(moderator.players[1]); //NOTE - 2번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[3].voteToPlayer(moderator.players[1]); //NOTE - 3번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[4].voteToPlayer(moderator.players[1]); //NOTE - 4번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[5].voteToPlayer(moderator.players[1]); //NOTE - 5번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표
  moderator.players[6].voteToPlayer(moderator.players[2]); //NOTE - 6번 인덱스 플레이어가 2번 인덱스 플레이어에게 투표
  moderator.players[7].voteToPlayer(moderator.players[1]); //NOTE - 7번 인덱스 플레이어가 1번 인덱스 플레이어에게 투표

  moderator.startTimer(90); //NOTE - 시간 재기

  const voteBoard = moderator.getPlayersVoteResult(); //NOTE - 투표 결과 확인 (누가 얼마나 투표를 받았는지)
  const mostVoteResult = moderator.getMostVotedPlayer(); //NOTE - 투표를 가장 많이 받은 사람 결과 (확정X, 동률일 가능성 존재)

  moderator.resetVote(); //NOTE - 플레이어들이 한 투표 기록 리셋
  moderator.players.forEach((player) => moderator.showVoteResult(voteBoard));

  if (mostVoteResult.isValid) {
    //NOTE - 투표 성공

    moderator.players.forEach((player) =>
      moderator.speak(player, `${mostVoteResult.result.userNickname}님이 마피아로 지복되었습니다.`)
    );

    moderator.players.forEach((player) =>
      moderator.speak(player, `${mostVoteResult.result.userNickname}님은 최후의 변론을 시작하세요.`)
    );

    moderator.startTimer(90); //NOTE - 시간 재기

    moderator.players.forEach((player) => moderator.speak(player, "찬성/반대 투표를 해주세요."));

    moderator.startTimer(90); //NOTE - 시간 재기

    moderator.players[0].voteYesOrNo(votes, false); //NOTE - 0번 인덱스 플레이어가 찬성에 투표
    moderator.players[1].voteYesOrNo(votes, true); //NOTE - 1번 인덱스 플레이어가 찬성에 투표
    moderator.players[2].voteYesOrNo(votes, true); //NOTE - 2번 인덱스 플레이어가 찬성에 투표
    moderator.players[3].voteYesOrNo(votes, false); //NOTE - 3번 인덱스 플레이어가 반대에 투표
    moderator.players[4].voteYesOrNo(votes, false); //NOTE - 4번 인덱스 플레이어가 반대에 투표
    moderator.players[5].voteYesOrNo(votes, false); //NOTE - 5번 인덱스 플레이어가 찬성에 투표
    moderator.players[6].voteYesOrNo(votes, true); //NOTE - 6번 인덱스 플레이어가 찬성에 투표
    moderator.players[7].voteYesOrNo(votes, true); //NOTE - 7번 인덱스 플레이어가 찬성에 투표

    const yesOrNoVoteResult = moderator.getYesOrNoVoteResult(votes); //NOTE - 찬반 투표 결과 (확정X, 동률 나올 수 있음)

    moderator.showVoteResult(yesOrNoVoteResult.result.detail);

    //NOTE - 투표 결과가 유효하고(동률이 아님), 찬성이 반대보다 많은 경우
    if (yesOrNoVoteResult.isValid && yesOrNoVoteResult.result) {
      killedPlayer = moderator.killPlayer(mostVoteResult); //NOTE - 투표를 가장 많이 받은 플레이어 사망

      moderator.setRoles();
      mafiaPlayers = moderator.roles["마피아"];
      doctorPlayer = moderator.roles["의사"];
      policePlayer = moderator.roles["경찰"];
      citizenPlayers = moderator.roles["시민"];

      isPlayerMafia = mafiaPlayers.indexOf(killedPlayer) !== -1; //NOTE - 죽은 플레이어가 마피아인지 확인

      //NOTE - 죽은 플레이어가 마피아인지 시민인지 알림
      moderator.players.forEach((player) =>
        isPlayerMafia ? moderator.speak(player, "마피아가 죽었습니다.") : moderator.speak(player, "시민이 죽었습니다.")
      );

      moderator.players.forEach((clientPlayer) => {
        const role = isPlayerMafia ? "마피아" : "시민";

        moderator.openPlayerRole(clientPlayer, killedPlayer, role);
      });
    } else {
      //NOTE - 투표 실패, 동률이 나옴
      console.log("동률 나옴");
    }
  }

  moderator.morningOver(); //NOTE - 아침 종료
  moderator.nightStart(); //NOTE - 밤이 시작됨

  //NOTE - 모든 유저들 화상 카메라와 마이크만 끔
  moderator.players.forEach((clientPlayer) =>
    moderator.players.forEach((player) => {
      moderator.turnOffCamera(clientPlayer, player);
      moderator.turnOffMike(clientPlayer, player);
    })
  );

  moderator.players.forEach((player) => moderator.speak(player, "마피아는 누구를 죽일지 결정해주세요."));

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 켬
  mafiaPlayers.forEach((clientPlayer) => {
    mafiaPlayers.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    });
  });

  mafiaPlayers.forEach((mafiaPlayer) => {
    moderator.speak(mafiaPlayer, "제스처를 통해 상의하세요.");
    moderator.speak(mafiaPlayer, "누구를 죽일지 선택하세요.");
  });

  moderator.startTimer(90); //NOTE - 시간 재기
  playerToKill = mafiaPlayers[0].choosePlayer(moderator.players[0]); //NOTE - 가장 먼저 선택한 마피아의 지시를 따름, 죽일 플레이어 결정

  //NOTE - 마피아 유저들 화면의 마피아 유저 화상 카메라와 마이크만 끔
  mafiaPlayers.forEach((clientPlayer) => {
    mafiaPlayers.forEach((player) => {
      moderator.turnOffCamera(clientPlayer, player);
      moderator.turnOffMike(clientPlayer, player);
    });
  });

  mafiaPlayers.forEach((player) => moderator.speak(player, "의사는 누구를 살릴 지 결정하세요."));

  //NOTE - 의사가 살아있을 경우
  if (moderator.roles["의사"] !== undefined) {
    doctorPlayer = moderator.roles["의사"]; //NOTE - 역할이 의사인 플레이어 인덱스 반환

    moderator.startTimer(90); //NOTE - 시간 재기

    playerToSave = doctorPlayer.choosePlayer(moderator.players[0]); //NOTE - 의사가 살릴 플레이어를 선택
  }

  moderator.players.forEach((player) => moderator.speak(player, "경찰은 마피아 의심자를 결정해주세요."));

  //NOTE - 경찰이 살아있을 경우
  if (moderator.roles["경찰"] !== undefined) {
    policePlayer = moderator.roles["경찰"];

    isPlayerMafia = policePlayer.checkPlayerMafia(moderator.players[0]); //NOTE - 0번 인덱스 플레이어가 마피아인지 의심

    isPlayerMafia
      ? moderator.speak(policePlayer, "해당 플레이어는 마피아가 맞습니다.")
      : moderator.speak(policePlayer, "해당 플레이어는 마피아가 아닙니다.");
  }

  //NOTE - 죽일 플레이어와 살릴 플레이어 결정하고 생사 결정
  if (playerToKill !== playerToSave) {
    mafiaPlayers[0].killPlayer(playerToKill);
    doctorPlayer.savePlayer(playerToSave);
  }

  moderator.setRoles();
  mafiaPlayers = moderator.roles["마피아"];
  doctorPlayer = moderator.roles["의사"];
  policePlayer = moderator.roles["경찰"];
  citizenPlayers = moderator.roles["시민"];

  moderator.nightOver(); //NOTE - 밤 종료
  moderator.roundOver(); //NOTE - 라운드 종료
  moderator.roundStart(); //NOTE - 라운드 시작
  moderator.morningStart(); //NOTE - 아침 시작

  //NOTE - 모든 유저들 화상 카메라와 마이크만 켬
  moderator.players.forEach((clientPlayer) =>
    moderator.players.forEach((player) => {
      moderator.turnOnCamera(clientPlayer, player);
      moderator.turnOnMike(clientPlayer, player);
    })
  );

  //NOTE - 마피아가 죽일려고한 마피아가 살았는지 죽었는지 확인
  if (killedPlayer.isLived) {
    moderator.players.forEach((player) => moderator.speak(player, "의사의 활약으로 아무도 죽지 않았습니다."));
  } else {
    moderator.players.forEach((player) => moderator.speak(player, `${killedPlayer.userNickname}님이 죽었습니다.`));
  }

  moderator.speak(killedPlayer, "게임을 관전 하시겠습니까? 나가시겠습니까?");
  choiceToExit = true; //NOTE - 나간다고 가정

  //NOTE - 방을 나갈지 관전할지
  if (choiceToExit) {
    killedPlayer.exit(); //NOTE - 플레이어는 방을 나감, 중간에 나가는 경우에도 사용할 수 있음
  }
  moderator.morningOver(); //NOTE - 아침 종료
  moderator.roundOver(); //NOTE - 라운드 종료

  if (moderator.whoWins.isValid) {
    //NOTE - 게임 종료 만족하는 지
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      moderator.speak(players, playerIndex`${moderator.whoWins.result} 팀이 이겼습니다.`); //NOTE - 어느 팀이 이겼는지 알림
    }

    gameOver(); //NOTE - 게임 종료
  }
};
