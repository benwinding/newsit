import React from "react";
import { ButtonResult } from "../browser/models";

export function BtnItem(props: {
  reverseLayout: boolean;
  title: string;
  logoUrl: string;
  submitLink: string;
  result: ButtonResult;
  sizeChanged: () => void;
}) {
  const { logoUrl, title, reverseLayout, result, submitLink } = props;
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
        title={title}
        submitLink={submitLink}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h5 style={{ margin: "2px" }}>All {title} Results</h5>
            <p style={{ margin: "2px", fontSize: "0.6em" }}>
              {other_results.length} found
            </p>
          </div>
          {other_results.map((r, i) => {
            return (
              <OtherResultItem
                key={i}
                commentsCount={r.comments_count}
                commentsLink={r.comments_link}
                postAuthor={r.post_by}
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
  postAuthor: string;
  postTitle: string;
  postUrl: string;
  postDate: string;
  upvotes: number;
}) {
  const {
    commentsCount,
    commentsLink,
    postAuthor,
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
        href={commentsLink}
        title="Open's link to comments"
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
          <div style={{ fontSize: "0.5em" }}>by {postAuthor}</div>
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
  submitLink: string;
  link: string;
  title: string;
  text: string;
  reverseLayout: boolean;
  menuDisabled: boolean;
  menuOpen: boolean;
  menuOpenChanged: (isOpen: boolean) => void;
}) {
  const {
    reverseLayout,
    iconSrc,
    submitLink,
    title,
    text,
    link,
    menuDisabled,
    menuOpen,
    menuOpenChanged,
  } = props;
  const menuEnabled = !menuDisabled;
  const hasLink = !!link;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: reverseLayout ? "row" : "row-reverse",
        alignItems: "center",
        width: "100%",
      }}
    >
      {menuEnabled && (
        <img
          src={iconSrc}
          style={{
            height: "18px",
            margin: "0",
            padding: 0,
            paddingLeft: "3px",
          }}
        />
      )}
      {hasLink && (
        <a
          target="_blank"
          href={link}
          title={"click to view discussion"}
          style={{
            textDecoration: "underline",
            cursor: "pointer",
            padding: "3px 5px",
          }}
        >
          {text}
        </a>
      )}
      {menuOpen && <span style={{ width: "100%" }}></span>}
      {(!hasLink || menuOpen) && (
        <a
          target="_blank"
          href={submitLink}
          title={
            (!hasLink ? "No submissions found, " : "") +
            "click to submit to " +
            title
          }
          style={{
            textDecoration: "none",
            cursor: "pointer",
            padding: "3px 2px",
          }}
        >
          +
        </a>
      )}
      <div
        style={{
          position: "relative",
          borderRadius: "50px",
          width: "0px",
          height: "16px",
          overflow: "hidden",
          padding: `0 ${menuEnabled && "8px"}`,
          transform: `rotate(${menuOpen ? "0" : "180"}deg)`,
          backgroundColor: "#b1b1b159",
          boxShadow: menuEnabled && "#00000047 0px 1px 4px 1px",
          marginRight: menuEnabled && "3px",
          cursor: menuDisabled ? "unset" : "pointer",
        }}
        onClick={() => menuEnabled && menuOpenChanged(!menuOpen)}
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
