import React from "react";

export function useApi<T>(
  action: () => Promise<T>,
  initial: T
): [T, () => any, boolean] {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(initial);
  const [fetchFlag, setFetchFlag] = React.useState(0);
  React.useEffect(() => {
    if (!fetchFlag) {
      return;
    }
    let mounted = true;
    setLoading(true);
    action().then((res) => {
      setLoading(false);
      if (mounted) {
        setResult(res);
      }
    });
    return () => {
      mounted = false;
    };
  }, [fetchFlag]);

  function triggerFetch() {
    setFetchFlag(Math.random());
  }
  return [result, triggerFetch, loading];
}
