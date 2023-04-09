<select id="roomSize">
  <option value="">Select room size</option>
  {Array.from({ length: 100 }, (_, i) => (
    <option key={i + 1} value={i + 1}>
      {i + 1}
    </option>
  ))}
</select>;
