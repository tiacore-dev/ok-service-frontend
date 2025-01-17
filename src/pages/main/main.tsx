import { Layout } from "antd";
import * as React from "react";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";

export const Main = () => {
  const { Content } = Layout;

  return (
    <>
      <Content
        style={{
          padding: isMobile() ? 0 : 8,
          margin: 0,
          minHeight: minPageHeight(),
          background: "#FFF",
        }}
      >
        Эта страница еще не готова
      </Content>
    </>
  );
};
