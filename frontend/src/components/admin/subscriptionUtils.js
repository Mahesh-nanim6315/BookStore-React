export const defaultSubscriptionSummary = {
  total: 0,
  paid: 0,
  active: 0,
  grace_period: 0,
}

export const subscriptionStatusLabelMap = {
  free: 'Free',
  active: 'Active',
  trialing: 'Trialing',
  grace_period: 'Grace Period',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export const formatSubscriptionDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '-'
