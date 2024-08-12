import React from "react";
import Nav from "./Nav";
import Link from "next/link";
import Logo from "@/assets/images/logo.svg";
import Image from "next/image";
import S from "@/style/commons/commons.module.css";

const Header = () => {
  return (
    <div className={S.headerWrap}>
      <header className={S.header}>
        <h1>
          <Link replace={true} href="/main">
            <Image src={Logo} alt="Logo" priority />
          </Link>
        </h1>
        <Nav />
      </header>
    </div>
  );
};

export default Header;
