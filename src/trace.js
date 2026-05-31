function createTrace() {
  const steps = [];

  return {
    add(component, status, message, details = {}) {
      steps.push({
        at: new Date().toISOString(),
        component,
        status,
        message,
        details
      });
    },
    all() {
      return steps;
    },
    hasFailure() {
      return steps.some((step) => step.status === "FAILED");
    },
    hasWarning() {
      return steps.some((step) => step.status === "WARN" || step.status === "DEGRADED");
    }
  };
}

module.exports = { createTrace };
