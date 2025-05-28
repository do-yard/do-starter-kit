import React from 'react';

type HelloProps = {
  name: string;
};

/**
 * Renders a greeting message with the provided name.
 * @param name - The name to include in the greeting.
 */
const Hello = ({ name }: HelloProps) => (
  <div className="text-xl font-bold text-blue-600">Hello, {name}!</div>
);

export default Hello;
