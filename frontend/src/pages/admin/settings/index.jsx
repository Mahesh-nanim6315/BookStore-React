import React from 'react'

const AdminSettingsIndex = () => {
  return (
    <div className="page">
{/*  */}
{/*  */}
{/* 
 */}

<div className="settings-container" id="main-settings-container">
    <div className="settings-header">
        <h2 className="settings-title">Platform Settings</h2>
        <p className="settings-subtitle">Configure and manage your platform preferences</p>
    </div>

    <form method="POST" action="" id="settings-form">
{/*          */}

        <div className="settings-tabs-wrapper" id="settings-tabs-container">

            {/* General Settings Card */}
            <div className="settings-card" id="general-settings-card">
                <div className="settings-card-header">
                    <h4 className="settings-card-title">General Settings</h4>
                    <span className="settings-card-icon">âš™ï¸</span>
                </div>
                
                <div className="settings-card-body">
                    <div className="settings-form-group">
                        <label htmlFor="site_name" className="settings-label">Site Name</label>
                        <input type="text" 
                               id="site_name" 
                               name="site_name"
                               className="settings-input"
                               value=""
                               placeholder="Enter site name" />
                    </div>

                    <div className="settings-form-group">
                        <label htmlFor="support_email" className="settings-label">Support Email</label>
                        <input type="email" 
                               id="support_email" 
                               name="support_email"
                               className="settings-input"
                               value=""
                               placeholder="support.com" />
                    </div>

                    <div className="settings-form-group">
                        <label htmlFor="maintenance_mode" className="settings-label">Maintenance Mode</label>
                        <select id="maintenance_mode" 
                                name="maintenance_mode" 
                                className="settings-select">
                            <option value="0">Disabled</option>
                            <option value="1"
                                >
                                Enabled
                            </option>
                        </select>
                        <small className="settings-help-text">When enabled, only admins can access the site</small>
                    </div>
                </div>
            </div>

            {/* Subscription Settings Card */}
            <div className="settings-card" id="subscription-settings-card">
                <div className="settings-card-header">
                    <h4 className="settings-card-title">Subscription Settings</h4>
                    <span className="settings-card-icon">ðŸ’³</span>
                </div>
                
                <div className="settings-card-body">
                    <div className="settings-form-group">
                        <label htmlFor="subscriptions_enabled" className="settings-label">Enable Subscriptions</label>
                        <select id="subscriptions_enabled" 
                                name="subscriptions_enabled" 
                                className="settings-select">
                            <option value="1">Yes</option>
                            <option value="0"
                                >
                                No
                            </option>
                        </select>
                    </div>

                    <div className="settings-form-group">
                        <label htmlFor="free_trial_days" className="settings-label">Free Trial Days</label>
                        <input type="number" 
                               id="free_trial_days" 
                               name="free_trial_days"
                               className="settings-input"
                               value=""
                               min="0"
                               max="365" />
                    </div>
                </div>
            </div>

            {/* Content Settings Card */}
            <div className="settings-card" id="content-settings-card">
                <div className="settings-card-header">
                    <h4 className="settings-card-title">Content Settings</h4>
                    <span className="settings-card-icon">ðŸ“š</span>
                </div>
                
                <div className="settings-card-body">
                    <div className="settings-form-group">
                        <label htmlFor="auto_approve_reviews" className="settings-label">Auto Approve Reviews</label>
                        <select id="auto_approve_reviews" 
                                name="auto_approve_reviews" 
                                className="settings-select">
                            <option value="1">Yes</option>
                            <option value="0"
                                >
                                No
                            </option>
                        </select>
                    </div>

                    <div className="settings-form-group">
                        <label htmlFor="books_per_page" className="settings-label">Books Per Page</label>
                        <input type="number" 
                               id="books_per_page" 
                               name="books_per_page"
                               className="settings-input"
                               value=""
                               min="5"
                               max="100" />
                    </div>
                </div>
            </div>

        </div>

        <div className="settings-actions" id="settings-form-actions">
            <button type="submit" className="settings-btn settings-btn-primary" id="save-settings-btn">
                <span className="btn-icon">ðŸ’¾</span>
                Save Settings
            </button>
            <button type="reset" className="settings-btn settings-btn-secondary" id="reset-settings-btn">
                <span className="btn-icon">â†©ï¸</span>
                Reset
            </button>
        </div>
    </form>
</div>
{/* 
 */}
    </div>
  )
}

export default AdminSettingsIndex








