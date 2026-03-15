import React from 'react'

const SubscriptionsIndex = () => {
  return (
    <div className="page">
{/*  */}
{/* 
 */}
<div className="plans-container">

    <div className="plans-header">
        <h1>Choose Your Reading Plan</h1>
        <p>Unlock unlimited stories and immersive audiobooks.</p>
{/*          */}
            <p style={{ marginTop: '8px', color: '#b45309', background: '#fef3c7', padding: '8px 12px', borderRadius: '8px' }}>
                Subscriptions are currently disabled. Existing subscribers keep access, but new upgrades are paused.
            </p>
{/*          */}
    </div>

    <div className="billing-toggle">
        <button id="monthlyBtn" className="active">Monthly</button>
        <button id="yearlyBtn">Yearly</button>
    </div>

    <div className="plans-grid">
{/*          */}
{/*              */}
                $planKey = strtolower(explode(' ', $plan['name'])[0]);
                $isCurrentPlan = auth()->check() && auth()->user()->plan === $planKey;
{/*              */}

            <div className="plan-card ">
{/*                 ) */}
                    <div className="popular-badge">Most Popular</div>
{/*                  */}

                <h2></h2>

                <div className="price">
                    <span className="amount" data-monthly="" data-yearly="">
                        $
                    </span>
                    <small>/month</small>
                </div>

                <ul>
{/*                      */}
                        <li>&#10004; </li>
{/*                      */}
                </ul>
{/* 
                 */}
                    <div className="current-plan-badge">Current Plan</div>
{/*                  */}
{/* 
                 */}
                    <button type="button" className="subscribe-btn" disabled>
                        Subscriptions Disabled
                    </button>
{/*                  */}
                    <form method="POST" action="">
{/*                          */}
                        <input type="hidden" name="plan" value="" />
                        <input type="hidden" name="billing_cycle" value="monthly" />
{/* 
                         */}
                            $buttonText = 'Choose Plan';

                            if ($isCurrentPlan) {
                                $buttonText = 'Current Plan';
                            } elseif (auth()->check() && $planKey === 'free' && auth()->user()->plan !== 'free') {
                                $buttonText = 'Downgrade to Free';
                            } elseif (auth()->check() && auth()->user()->plan === 'premium' && $planKey === 'ultimate') {
                                $buttonText = 'Upgrade to Ultimate';
                            }
{/*                          */}

                        <button type="submit" className="subscribe-btn" >
                            
                        </button>
                    </form>
{/*                  */}
            </div>
{/*          */}
    </div>
</div>
{/*  */}


    </div>
  )
}

export default SubscriptionsIndex







