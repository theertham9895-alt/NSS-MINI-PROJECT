import React from 'react';

function Card({ children, className = '', hover = false }) {
  let classes = 'card';
  if (hover) classes += ' card-hover';
  if (className) classes += ' ' + className;
  
  return <div className={classes}>{children}</div>;
}

function CardHeader({ children, className = '' }) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

function CardTitle({ children }) {
  return <h3 className="card-title">{children}</h3>;
}

function CardDescription({ children }) {
  return <p className="card-description">{children}</p>;
}

function CardContent({ children, className = '' }) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };