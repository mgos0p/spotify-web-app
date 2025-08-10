import React from "react";
import { NextPageContext } from "next";

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function Error({ statusCode, hasGetInitialPropsRun, err }: ErrorProps) {
  if (!hasGetInitialPropsRun && err) {
    // クライアントで getInitialProps が呼ばれていないため、これはクライアント側のエラー
    console.error("Client-side error:", err);
  }

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred on client"}
      </h1>
      <p>
        {statusCode === 404
          ? "This page could not be found."
          : "Sorry, there was a problem loading this page."}
      </p>
      <button
        onClick={() => (window.location.href = "/")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#1db954",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        Go Home
      </button>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, hasGetInitialPropsRun: true };
};

export default Error;
