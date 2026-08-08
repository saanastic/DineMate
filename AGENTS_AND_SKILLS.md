# DineMate Agents & Skills

## 1. Custom Agent: FloorPulseAgent

FloorPulseAgent is the flagship AI agent in the DineMate platform. Its purpose is to create a live understanding of dining room activity, predict operational pressure, and generate proactive recommendations for staff and managers.

### Responsibilities
- Analyze occupancy trends and reservation pressure
- Forecast peak rush periods based on recent traffic patterns
- Detect low-stock or high-risk menu items such as Wagyu beef
- Generate real-time upselling prompts for staff
- Create brief action summaries for the manager dashboard

### Example Declaration

```js
export const floorPulseAgent = {
  id: 'floor-pulse-agent',
  name: 'FloorPulseAgent',
  description: 'Monitors restaurant floor activity and recommends operational actions',
  triggers: ['order.created', 'table.status.changed', 'inventory.low'],
  skills: ['calculateTableTurnoverRate'],
  owner: 'ops-intelligence'
};
```

## 2. Custom Skill: calculateTableTurnoverRate

This skill calculates the average duration that tables remain occupied and estimates peak utilization across a service window.

### Example Implementation

```js
export function calculateTableTurnoverRate({ reservations, checkIns, checkOuts, totalTables }) {
  if (!Array.isArray(checkIns) || !Array.isArray(checkOuts) || totalTables <= 0) {
    return {
      averageOccupancyMinutes: 0,
      peakUtilizationPercent: 0,
      sampleSize: 0
    };
  }

  const durations = checkIns.map((entry, index) => {
    const checkout = checkOuts[index];
    if (!checkout) return 0;
    return Math.max(0, checkout.timestamp - entry.timestamp);
  }).filter(Boolean);

  const averageOccupancyMinutes = durations.length
    ? durations.reduce((sum, value) => sum + value, 0) / durations.length / 60
    : 0;

  const peakUtilizationPercent = Math.min(100, (durations.length / totalTables) * 100);

  return {
    averageOccupancyMinutes: Number(averageOccupancyMinutes.toFixed(1)),
    peakUtilizationPercent: Number(peakUtilizationPercent.toFixed(1)),
    sampleSize: durations.length
  };
}
```

## 3. API Contract

### Agent Execution Endpoint

```http
POST /api/v1/agents/floor-pulse/execute
Content-Type: application/json
```

### Request Body

```json
{
  "venueId": "venue_001",
  "windowMinutes": 60,
  "includeUpsell": true
}
```

### Response Body

```json
{
  "agentId": "floor-pulse-agent",
  "rushForecast": "high",
  "flaggedItems": ["wagyu-beef"],
  "upsellSuggestions": [
    "Recommend a premium dessert pairing to tables with high spend potential"
  ],
  "tableMetrics": {
    "averageOccupancyMinutes": 48.3,
    "peakUtilizationPercent": 82.5,
    "sampleSize": 14
  }
}
```

## 4. Integration Notes

- Declare agents in a central registry so they can be discovered by the orchestration layer.
- Attach skills through explicit capabilities rather than hard-coded logic.
- Store generated recommendations in the AI insight store for audit and future retraining.
- Keep the agent output human-readable and actionable for staff workflows.
