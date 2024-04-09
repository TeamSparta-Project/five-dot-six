import { createClient } from "./client";

const supabase = createClient();

//NOTE - 해당 범위의 방들을 반환(데이터베이스의 인덱스는 0부터 시작, rowStart 인덱스와 rowEnd 인덱스를 포함해서 반환), 날짜 내림차순
export const getRooms = async (rowStart: number, rowEnd: number) => {
  const { data, error } = await supabase
    .from("room_table")
    .select("*, users:room_user_match_table(user_id)")
    .range(rowStart, rowEnd)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

//NOTE - 제목에 키워드가 포함된 방 목록 반환 (날짜 내림차순)
export const getRoomsWithKeyword = async (keyword: string) => {
  const { data, error } = await supabase
    .from("room_table")
    .select("*, users:room_user_match_table(user_id)")
    .like("title", `%${keyword}%`)
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

//NOTE - 방 만들기 (방만 만듬, 방을 만들고 접속도 해야함)
export const createRoom = async (title: string, game_category: string, total_user_count: number) => {
  const { data, error } = await supabase
    .from("room_table")
    .insert([{ title, game_category, current_user_count: 0, total_user_count }])
    .select();
  if (error) {
    throw new Error(error.message);
  }
  return data[0];
};

//NOTE - 방에 들어가기 (방 자리에 여유가 있고, 자신이 방에 없으면 방에 들어갈 수 있음 )
export const joinRoom = async (room_id: string, user_id: string) => {
  const { total_user_count, current_user_count } = await getUserCountInRoom(room_id);
  const usersInRoom = await getUsersInRoom(room_id);

  if (total_user_count - current_user_count > 0 && usersInRoom.indexOf(user_id) === -1) {
    await changeUserCountInRoom(room_id, 1);
    const { data, error } = await supabase.from("room_user_match_table").insert([{ room_id, user_id }]).select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  throw new Error("방에 입장할 수 없습니다.");
};

//NOTE - 방 나가기 (내가 방에 존재하고 나 이외에 유저가 있으면 방에서 나감, 다른 유저가 방에 없으면 방 삭제)
export const exitRoom = async (room_id: string, user_id: string) => {
  const { current_user_count } = await getUserCountInRoom(room_id);
  const usersInRoom = await getUsersInRoom(room_id);

  if (current_user_count > 1 && usersInRoom.indexOf(user_id) !== -1) {
    await changeUserCountInRoom(room_id, -1);

    const { data, error } = await supabase
      .from("room_user_match_table")
      .delete()
      .eq("room_id", room_id)
      .eq("user_id", user_id)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } else if (current_user_count === 1 && usersInRoom.indexOf(user_id) !== -1) {
    const data = deleteRoom(room_id, user_id);
    return data;
  }
  throw new Error("방에서 나갈 수 없습니다.");
};

//NOTE - 방 삭제하기 (방에 있는 유저가 오직 자신일 경우에 방 삭제)
export const deleteRoom = async (room_id: string, user_id: string) => {
  const { current_user_count } = await getUserCountInRoom(room_id);
  const usersInRoom = await getUsersInRoom(room_id);

  if (current_user_count === 1 && usersInRoom.indexOf(room_id) !== -1) {
    const { data, error } = await supabase.from("room_table").delete().eq("room_id", room_id);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  throw new Error("방을 삭제할 수 없습니다.");
};

//NOTE - 빠른 방 입장 (전체 인원 오름차순으로 정렬 후, 현재 인원 내림차순 정렬 후, 남은 인원이 0명인 방을 제외한 후, 첫 번째 방 입장)
export const fastJoinRoom = async (user_id: string) => {
  const { data, error } = await supabase
    .from("room_table")
    .select("*")
    .order("total_user_count", { ascending: true })
    .order("current_user_count", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  try {
    const rows = data.filter((row) => row.current_user_count !== row.total_user_count);
    const room_id = rows[0].room_id;
    const result = await joinRoom(room_id, user_id);
    return result;
  } catch (e) {
    throw new Error("빠른 방 입장에 실패했습니다.");
  }
};

//NOTE - 방의 현재 인원 변경 (방의 인원을 change만큼 더함, change는 음수가 될 수 있어서, 인원을 감소할 수 있음)
export const changeUserCountInRoom = async (room_id: string, change: number) => {
  const { current_user_count } = await getUserCountInRoom(room_id);
  const { data, error } = await supabase
    .from("room_table")
    .update({ current_user_count: current_user_count + change })
    .eq("room_id", room_id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

//NOTE - 방에 들어갈 수 있는 총인원과 현재 인원 반환
export const getUserCountInRoom = async (room_id: string) => {
  const { data, error } = await supabase
    .from("room_table")
    .select("current_user_count, total_user_count")
    .eq("room_id", room_id);
  if (error) {
    throw new Error(error.message);
  }
  return { total_user_count: data[0].total_user_count, current_user_count: data[0].current_user_count };
};

//NOTE - 방의 총 갯수 반환
export const getRoomsCount = async () => {
  const { count, error } = await supabase.from("room_table").select("*", { count: "exact", head: true });
  if (error) {
    throw new Error(error.message);
  }
  return count;
};

//NOTE - roomId의 방에 입장한 유저들 id 목록 반환
export const getUsersInRoom = async (roomId: string) => {
  const { data, error } = await supabase.from("room_user_match_table").select("user_id").eq("room_id", roomId);

  if (error) {
    throw new Error(error.message);
  }
  return data.map((row) => row.user_id);
};
