import React from "react";
import { ButtonResult } from "../browser/models";

export function BtnItem(props: {
  reverseLayout: boolean;
  logoUrl: string;
  result: ButtonResult;
  sizeChanged: () => void;
}) {
  const { logoUrl, reverseLayout, result } = props;
  const { link, text, other_results } = result;

  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    props.sizeChanged();
  }, [menuOpen]);

  return (
    <div
      style={{
        display: "flex",
        width: menuOpen ? "300px" : "min-content",
        flexDirection: "column",
        alignItems: "flex-start",
        fontSize: "1em",
        fontFamily: "monospace",
      }}
    >
      <ButtonLine
        reverseLayout={reverseLayout}
        iconSrc={logoUrl}
        link={link}
        text={text}
        menuDisabled={!other_results?.length}
        menuOpen={menuOpen}
        menuOpenChanged={(isOpen) => {
          setMenuOpen(isOpen);
        }}
      />

      {menuOpen && (
        <div
          style={{
            height: "200px",
            width: "100%",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h5 style={{ margin: "2px" }}>All Results</h5>
          {other_results.map((r) => {
            return (
              <OtherResultItem
                commentsCount={r.comments_count}
                commentsLink={r.comments_link}
                postTitle={r.post_title}
                postUrl={r.post_url}
                postDate={r.post_date}
                upvotes={r.post_upvotes}
              ></OtherResultItem>
            );
          })}
        </div>
      )}
    </div>
  );
}

function OtherResultItem(props: {
  commentsCount: number;
  commentsLink: string;
  postTitle: string;
  postUrl: string;
  postDate: string;
  upvotes: number;
}) {
  const {
    commentsCount,
    commentsLink,
    postTitle,
    postUrl,
    postDate,
    upvotes,
  } = props;

  return (
    <div
      style={{
        margin: "1px 2px",
        padding: "4px",
        backgroundColor: "white",
        color: "black",
      }}
    >
      <a
        href={postUrl}
        title="Open's link to post"
        target="_blank"
        style={{
          color: "black",
          textDecoration: "underline",
          fontSize: "1.1em",
        }}
      >
        {postTitle}
      </a>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", fontSize: "0.6em" }}
        >
          <div style={{ color: "#555" }}>{upvotes} points</div>
          <div style={{ color: "#222" }}>({postDate})</div>
        </div>
        <a
          href={commentsLink}
          title="Open's link to comments"
          target="_blank"
          style={{
            fontSize: "0.7em",
            color: "black",
            textDecoration: "underline",
          }}
        >
          {commentsCount} comments
        </a>
      </div>
    </div>
  );
}

function ButtonLine(props: {
  iconSrc: string;
  link: string;
  text: string;
  reverseLayout: boolean;
  menuDisabled: boolean;
  menuOpen: boolean;
  menuOpenChanged: (isOpen: boolean) => void;
}) {
  const {
    reverseLayout,
    iconSrc,
    text,
    link,
    menuDisabled,
    menuOpen,
    menuOpenChanged,
  } = props;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: reverseLayout ? "row" : "row-reverse",
        alignItems: "center",
        width: "100%",
      }}
    >
      <img
        src={iconSrc}
        style={{
          height: "18px",
          margin: "0",
          padding: 0,
          paddingLeft: "3px",
        }}
      />
      <a
        target="_blank"
        href={link}
        style={{
          textDecoration: !!link ? "underline" : "none",
          cursor: !!link ? "pointer" : "default",
          padding: "3px 5px",
        }}
      >
        {text}
      </a>
      {menuOpen && <span style={{ width: "100%" }}></span>}
      <div
        style={{
          position: "relative",
          borderRadius: "50px",
          width: "0px",
          height: "16px",
          overflow: "hidden",
          padding: "0 8px",
          transform: `rotate(${menuOpen ? "0" : "180"}deg)`,

          backgroundColor: "#b1b1b159",
          boxShadow: menuDisabled ? "unset" : "#00000047 0px 1px 4px 1px",
          marginRight: "3px",
        }}
        onClick={() => !menuDisabled && menuOpenChanged(!menuOpen)}
      >
        <span
          style={{
            position: "absolute",
            left: "25%",
            top: "21%",
          }}
        >
          ^
        </span>
      </div>
    </div>
  );
}
