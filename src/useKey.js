import { useEffect } from "react";

export function useKey(key, callback) {
  useEffect(
    function () {
      function eventHandler(e) {
        if (e.code.toLowerCase() === key.toLowerCase()) {
          callback();
        }
      }
      document.addEventListener("keydown", eventHandler);
      return () => document.removeEventListener("keydown", eventHandler);
    },
    [key, callback]
  );
}
