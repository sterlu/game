import React from 'react';
import "./Arrow.css";

export const ArrowPositive = ({ fromPos, toPos, diff = 0 }) => {
  return (
    <div className="arrow positive" style={{ marginBottom: diff }}>
      <div className="start" style={{ left: (fromPos.left > toPos.left ? -50 : 0), top: -20 }} />
      <div className="wide" style={{ left: Math.min(fromPos.left, toPos.left) - fromPos.left, width: (fromPos.left < toPos.left ? 4 : 2) + Math.abs(fromPos.left - toPos.left) - 50 }} />
      <div className="end" style={{ left: toPos.left - fromPos.left - (fromPos.left < toPos.left ? 50 : 0), top: toPos.top > fromPos.top ? 10 : -20 }} />
    </div>
  )
};

export const ArrowNegative = ({ fromPos, toPos, diff = 0 }) => {
  return (
    <div className="arrow negative" style={{ marginTop: diff }}>
      <div className="start" style={{ left: (fromPos.left < toPos.left ? 50 : 0) }} />
      <div className="wide" style={{ left: Math.min(fromPos.left, toPos.left) - fromPos.left + 50, width: (fromPos.left < toPos.left ? 4 : 2) + Math.abs(fromPos.left - toPos.left) - 50 }} />
      <div className="end" style={{ left: toPos.left - fromPos.left + (fromPos.left > toPos.left ? 50 : 0), bottom: toPos.top < fromPos.top ? 0 : -30 }} />
    </div>
  )
};

