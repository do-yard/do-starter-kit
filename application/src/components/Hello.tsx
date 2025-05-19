import React from 'react';

type HelloProps = {
  name: string;
};

const Hello = ({ name }: HelloProps) => (
  <div className="text-xl font-bold text-blue-600">Hello, {name}!</div>
);

export default Hello;
