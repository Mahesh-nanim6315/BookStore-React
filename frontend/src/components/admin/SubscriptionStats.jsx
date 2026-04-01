import React from 'react'

const statsConfig = [
  {
    key: 'total',
    label: 'Total users',
    description: 'All accounts tracked in the subscription workspace.',
  },
  {
    key: 'paid',
    label: 'Paid members',
    description: 'Users currently mapped to premium or ultimate plans.',
  },
  {
    key: 'active',
    label: 'Active members',
    description: 'Subscriptions with healthy ongoing access.',
  },
  {
    key: 'grace_period',
    label: 'Grace period',
    description: 'Accounts set to end at the close of the billing cycle.',
  },
]

const SubscriptionStats = ({ summary }) => {
  return (
    <div className="subscription-admin-stats">
      {statsConfig.map((stat) => (
        <article key={stat.key} className="subscription-admin-stat-card">
          <span>{stat.label}</span>
          <strong>{summary[stat.key] || 0}</strong>
          <p>{stat.description}</p>
        </article>
      ))}
    </div>
  )
}

export default SubscriptionStats
