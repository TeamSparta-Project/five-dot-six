import { Provider } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();
const defaultUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? process.env.NEXT_PUBLIC_VERCEL_URL
  : process.env.NEXT_PUBLIC_DEV_CLIENT_URL;
export const checkLogInSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error("유저의 로그인 확인에 실패했습니다.");
  }

  if (data.session?.user) {
    return data.session.user;
  }
};
export const checkUserLogIn = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error("유저의 로그인 확인에 실패했습니다.");
  }

  if (data.user) {
    return data.user;
  }
  return null;
};

export const emailLogIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error("일반 로그인에 실패했습니다.");
  }

  return data;
};

export const oAuthRegister = async (email: string, password: string, nickname: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname
      }
    }
  });

  if (error) {
    throw new Error("oAuth 회원가입에 실패했습니다.");
  }

  if (data.user) {
    return data.user.id;
  }

  return false;
};

export const oAuthLogIn = async (provider: Provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${defaultUrl}/sns-login`
    }
  });

  if (error) {
    throw new Error("SNS 계정 로그인에 실패했습니다.");
  }

  return data;
};

export const logOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error("로그아웃에 실패했습니다.");
  }
};

export const setUserNickname = async (nickname: string) => {
  const { data, error } = await supabase.auth.updateUser({
    data: { nickname }
  });

  if (error) {
    throw new Error("닉네임 수정에 실패했습니다.");
  }

  return data;
};
