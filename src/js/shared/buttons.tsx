import React from "react";

export function BtnItem(props: {
  reverseLayout: boolean;
  bgColor: string;
  logoUrl: string;
  link: string;
  text: string;
}) {
  const { logoUrl, link, text, bgColor, reverseLayout } = props;
  return (
    <div
      style={{
        backgroundColor: bgColor,
        width: "100%",
        height: '24px',
        display: "flex",
        flexDirection: reverseLayout ? "row" : "row-reverse",
        alignItems: "center",
      }}
    >
      <img
        src={logoUrl}
        style={{
          height: "18px",
          margin: "0",
          padding: 0,
          paddingLeft: '3px'
        }}
      />
      <a
        target="_blank"
        href={link}
        style={{
          textDecoration: !!link ? "underline" : "none",
          cursor: !!link ? "pointer" : "default",
          padding: "3px 5px",
          fontSize: "1em",
          fontFamily: "monospace",
        }}
      >
        {text}
      </a>
    </div>
  );
}
