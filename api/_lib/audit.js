export function auditEvent(event) {
  const record = {
    id: `audit_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...event
  };

  // Replace with Supabase/Neon insert. Console keeps Vercel logs useful until DB is connected.
  console.info(JSON.stringify({ audit: record }));
  return record;
}

export function errorEvent(event) {
  const record = {
    id: `err_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...event
  };

  console.error(JSON.stringify({ errorLog: record }));
  return record;
}

