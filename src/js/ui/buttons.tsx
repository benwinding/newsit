import React from "react";
import { ButtonResult } from "../shared/models";

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

  const Spacer = <span style={{ width: "100%" }}></span>;
  const DiscussionLink = <a
    target="_blank"
    href={link}
    title={"click to view discussion"}
    style={{
      textDecoration: "underline",
      cursor: "pointer",
      padding: "0px 5px",
      lineHeight: '1rem',
    }}
  >
    {text}
  </a>
  const DiscussionImg = <img
    src={iconSrc}
    style={{
      height: "18px",
      margin: "0",
    }}
  />;

  return (
    <div style={{
      width: '100%',
      padding: '3px',
      boxSizing: 'border-box',
    }}>
      <div
        style={{
          display: "flex",
          flexDirection: reverseLayout ? "row" : "row-reverse",
          alignItems: "center",
          gap: '3px',
        }}
      >
        {menuEnabled && DiscussionImg}
        {hasLink && DiscussionLink}
        {menuOpen && Spacer}
        {(!hasLink || menuOpen) && <SubmitButton hasLink={hasLink} submitLink={submitLink} title={title} />}
        <div><ExpanderButton onClick={() => menuEnabled && menuOpenChanged(!menuOpen)} menuEnabled={menuEnabled} menuOpen={menuOpen} /></div>
      </div>
    </div>
  );
}

function ExpanderButton(props: { onClick: () => void, menuEnabled: boolean, menuOpen: boolean}) {
  return <div
    style={{
      position: "relative",
      borderRadius: "50px",
      width: "16px",
      height: "16px",
      transform: `rotate(${props.menuOpen ? "0" : "180"}deg)`,
      backgroundColor: "#b1b1b159",
      boxShadow: props.menuEnabled && "#00000047 0px 1px 4px 1px",
      cursor: props.menuEnabled ?  "pointer" : "unset",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    onClick={props.onClick}
  >
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg id="i-chevron-top" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="10" height="10" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M30 20 L16 8 2 20" />
      </svg>
    </span>
  </div>
}

function SubmitButton(props: {submitLink: string, title: string, hasLink: boolean}) {
  return <a
    target="_blank"
    href={props.submitLink}
    title={
      (!props.hasLink ? "No submissions found, " : "") +
      "click to submit to " +
      props.title
    }
    style={{
      textDecoration: "none",
      cursor: "pointer",
      padding: "3px 2px",
      display: 'flex',
      alignItems: 'center',
    }}
  >
    <svg id="i-plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="12" height="12" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M16 2 L16 30 M2 16 L30 16" />
    </svg>
  </a>
}