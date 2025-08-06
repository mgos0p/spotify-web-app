import React, { useEffect } from "react";
import { Loader } from "../components/loader";
import { useRouter } from "next/router";

export default function Callback() {
  const router = useRouter();
  const { code } = router.query; // URLからcodeクエリパラメータを取得
  useEffect(() => {
    // codeが取得できたら、/にリダイレクト
    if (code) {
      router.push({
        pathname: "/",
        query: { code }, // URLにcodeクエリパラメータを含める
      });
    }
  }, [code, router]);

  return <Loader />;
}
