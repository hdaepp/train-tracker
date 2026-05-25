export function deltaLabel(scheduledTime, predictedTime) {
  if (!predictedTime) return { text: '—', cls: 'neutral' }
  const diffMins = Math.round((predictedTime - scheduledTime) / 60000)
  if (diffMins === 0) return { text: 'On time', cls: 'ontime' }
  if (diffMins < 0) return { text: `${diffMins} min`, cls: 'early' }
  return { text: `+${diffMins} min`, cls: 'late' }
}
