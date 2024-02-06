export const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formatHrs = hrs > 0 ? `${hrs}:` : "0";
  const formatMins = mins < 10 ? `0${mins}` : mins;
  const formatSecs = secs < 10 ? `0${secs}` : secs;
  return `${formatHrs}:${formatMins}:${formatSecs}`;
};
