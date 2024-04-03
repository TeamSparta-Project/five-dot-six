import { Provider } from "@supabase/supabase-js";
import { createClient } from "./client";

const supabase = createClient();

export const checkUserLogIn = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (user.user) {
    return true;
  } else {
    return false;
  }
};

export const emailLogIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

//NOTE - 배포 시 각 사이트에서 배포 사이트 작성할 것 (구글은 테스트버전에서 배포버전으로 변경할 것)
export const oAuthLogIn = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: "http://localhost:3000/test" //NOTE - 테스트 코드, 메인 페이지로 리다이렉트할 것
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const updateUserNickname = async (nickname: string) => {
  const { data, error } = await supabase.auth.updateUser({
    data: { nickname }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getUserInfo = async () => {
  const { data: user } = await supabase.auth.getUser();
  return user.user;
};

export const getUserNickname = async () => {
  const { data: user } = await supabase.auth.getUser();
  return user.user?.user_metadata.nickname;
};

export const getUserUid = async () => {
  const { data: user } = await supabase.auth.getUser();

  return user.user?.id;
};

export const getUserEmail = async () => {
  const { data: user } = await supabase.auth.getUser();

  return user.user?.email;
};