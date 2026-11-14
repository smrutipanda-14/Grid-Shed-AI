import {
  initialGridMetrics,
  initialTimelineData,
  initialJobs,
  initialReserveQueue,
  carbonSavingsSummary,
} from "../data/mockData";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const safeFetch = async (url, options = {}, fallbackData = null) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.warn(`[API] HTTP error ${res.status} for ${url}, using fallback.`);
      return fallbackData;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    // Backend offline / network unreachable -> silent fallback
    return fallbackData;
  }
};

export const gridApi = {
  getLiveGrid: async () => {
    const data = await safeFetch(`${API_BASE}/grid/live`, {}, initialGridMetrics);
    return data || initialGridMetrics;
  },

  getForecast: async () => {
    const data = await safeFetch(`${API_BASE}/grid/forecast`, {}, initialTimelineData);
    return data && Array.isArray(data) && data.length > 0 ? data : initialTimelineData;
  },

  simulateGrid: async (scenario) => {
    const data = await safeFetch(
      `${API_BASE}/grid/simulate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario }),
      },
      null
    );
    return data;
  },
};

export const jobsApi = {
  getJobs: async () => {
    const data = await safeFetch(`${API_BASE}/jobs`, {}, initialJobs);
    return data && Array.isArray(data) && data.length > 0 ? data : initialJobs;
  },

  getReservedJobs: async () => {
    const data = await safeFetch(`${API_BASE}/jobs/reserved`, {}, initialReserveQueue);
    return data && Array.isArray(data) && data.length > 0 ? data : initialReserveQueue;
  },

  submitJob: async (payload) => {
    const data = await safeFetch(
      `${API_BASE}/jobs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      null
    );
    return data;
  },
};

export const analyticsApi = {
  getSavings: async () => {
    const data = await safeFetch(`${API_BASE}/analytics/savings`, {}, carbonSavingsSummary);
    return data || carbonSavingsSummary;
  },
};
