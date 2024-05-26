import { useState } from "react";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: 0,
  padding: 0,
  textAlign: "center",
};
const startContainerStyle = {
  display: "flex",
};

export default function StarRating({
  starsNumber = 5,
  fontStyle = {},
  starsStyle = {},
  messages = [],
  defaultRating = 0,
  readOnly = false,
  onRate,
}) {
  const [rate, setRate] = useState(defaultRating);
  const [hoverRate, setHoverRate] = useState(0);
  function handleOnRating(rating) {
    if (!readOnly) {
      setRate(rating);
      onRate?.(rating);
    }
  }
  function handleHoverEnter(rating) {
    if (!readOnly) setHoverRate(rating);
  }
  function handleHoverLeave() {
    if (!readOnly) setHoverRate(0);
  }

  const finalFontStyle = {
    fontFamily: "sans-serif",
    fontSize: "25px",
    margin: 0,
    padding: 0,
    width: "25px",
    color: "#fcc519",
    ...fontStyle,
    display: "felx-item",
  };

  return (
    <div style={containerStyle}>
      <div style={startContainerStyle}>
        {Array.from({ length: starsNumber }, (_, i) => (
          <Star
            key={i + 1}
            full={(hoverRate || rate) >= i + 1}
            starsStyle={starsStyle}
            onHoverEnter={() => handleHoverEnter(i + 1)}
            onHoverLeave={handleHoverLeave}
            onRating={() => handleOnRating(i + 1)}
          />
        ))}
      </div>
      <p style={finalFontStyle}>{messages[(hoverRate || rate) - 1] || hoverRate || rate || ""}</p>
    </div>
  );
}

function Star({ full, starsStyle, onRating, onHoverEnter, onHoverLeave }) {
  const finalStarStyles = {
    width: `30px`,
    color: "#fcc519",
    margin: 0,
    padding: 0,
    cursor: "pointer",
    ...starsStyle,
    display: "flex",
  };
  return (
    <span
      role="button"
      style={finalStarStyles}
      onClick={onRating}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      {full ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill={finalStarStyles.color}
          stroke={finalStarStyles.color}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={finalStarStyles.color}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="{2}"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </span>
  );
}
