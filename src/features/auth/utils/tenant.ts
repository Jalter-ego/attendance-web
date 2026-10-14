export function isTenantSlug(value: string): boolean {
  return value.length <= 60 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export function tenantFromHostname(hostname: string, baseDomain = 'attlasian.test'): string | null {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  const domains = ['localhost', baseDomain.toLowerCase().replace(/^\.|\.$/g, '')]
  for (const domain of domains) {
    if (domain && host.endsWith(`.${domain}`)) {
      const slug = host.slice(0, -(domain.length + 1))
      return isTenantSlug(slug) ? slug : null
    }
  }
  return null
}
