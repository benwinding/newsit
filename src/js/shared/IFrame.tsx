import React, { useState } from "react";
import { createPortal } from "react-dom";

type Ev = React.SyntheticEvent<HTMLIFrameElement>;

export function IFrame(props: any) {
  const { children, title, onLoad } = props;
  const [iframeBody, setIframeBody] = useState(null);

  const handleLoad = (e: Ev) => {
    onLoad && onLoad(e);
    const iframeDoc = e.currentTarget.contentDocument;
    const s = iframeDoc.createElement('style');
    s.innerText = `    
    a, a:visited, a:active {
      color: white;
    }
    body {
      padding: 0;
      margin: 0;
    }
    `;
    iframeDoc.head.append(s);
    !e.defaultPrevented && setIframeBody(iframeDoc.body);
  };

  return (
    <iframe
      allowtransparency="true" 
      frameborder="0"
      srcDoc={`<!DOCTYPE html>`}
      {...props}
      title={title}
      onLoad={handleLoad}
    >
      {iframeBody && createPortal(children, iframeBody)}
    </iframe>
  );
}
