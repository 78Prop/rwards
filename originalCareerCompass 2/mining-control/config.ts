import os from 'os';

// Get the first non-internal IPv4 address
export function getHostAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '0.0.0.0'; // Fallback to all interfaces if no specific IP found
}

export const config = {
  port: process.env.PORT || 5000,
  host: getHostAddress(),
  pools: {
    kloudBugsCafe: {
      port: 4004,
      fee: 1.0,
      name: 'KLOUDBUGSCAFE POOL',
      address: 'bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6'
    },
    teraSocialJustice: {
      port: 4005,
      fee: 0.5,
      name: 'TERA SOCIAL JUSTICE POOL', 
      address: 'bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6'
    },
    teraToken: {
      port: 4006,
      fee: 2.0,
      name: 'TERA TOKEN POOL',
      address: 'bc1qj93mnxgm0xuwyh3jvvqurjxjyq8uktg4y0sad6'
    }
  }
};
