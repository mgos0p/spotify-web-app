import React from "react";
import { Oval } from "react-loader-spinner";

export const Loader: React.FC = () => (
  <div className="flex justify-center items-center p-5">
    <Oval height={40} width={40} color="#4fa94d" visible ariaLabel="loading" />
  </div>
);

