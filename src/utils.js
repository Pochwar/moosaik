const getDateTime = () => {
  const now = new Date();

  return `${now.toLocaleDateString()}-${now.toLocaleTimeString()}`;
}

export default getDateTime;
