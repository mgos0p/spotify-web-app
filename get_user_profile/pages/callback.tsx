import React, { useEffect } from "react";
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

  return <div>Loading...</div>;
}
