import React, { useState } from 'react'

const ProfileIndex = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="page">
      <div className="profile-header" style={{ marginTop: '65px' }}>
        <div className="profile-cover">
          <form>
            <input type="file" name="cover" id="coverInput" hidden />
            <img src="/images/default-cover.jpg" className="cover-img" alt="Cover" />
            <button type="button" className="change-cover-btn" onClick={() => document.getElementById('coverInput')?.click()}>
              Change Cover
            </button>
          </form>
        </div>

        <form className="profile-avatar">
          <div className="avatar-upload">
            <input type="file" name="avatar" id="avatarInput" hidden />
            <img src="/images/default-avatar.png" id="avatarPreview" className="avatar-img" alt="Avatar" />
            <button type="button" onClick={() => document.getElementById('avatarInput')?.click()}>
              Change Avatar
            </button>
            <h2 className="profile-name profile-name--avatar">User Name</h2>
          </div>
        </form>

        <div className="profile-meta">
          <div className="profile-identity">
            <p className="profile-email">user@example.com</p>
            <div className="badges-container">
              <span className="role-badges">User</span>
              <span className="free-badges">Free Plan</span>
            </div>
          </div>

          <div className="profile-right">
            <div className="profile-progress">
              <h4>Profile Completion</h4>
              <div className="progress-bars">
                <div className="progress-fills" style={{ width: '60%' }}></div>
              </div>
              <span>60% Completed</span>
            </div>

            <div className="profile-actions">
              <button className="edit-btns" onClick={() => setIsModalOpen(true)}>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card"><h3>0</h3><p>Books Purchased</p></div>
        <div className="stat-card"><h3>0</h3><p>Wishlist Items</p></div>
        <div className="stat-card"><h3>0</h3><p>Reviews Written</p></div>
        <div className="stat-card"><h3>Free</h3><p>Current Plan</p></div>
      </div>

      <div className="recent-purchases">
        <h3>Recent Purchases</h3>
        <p className="no-books">You haven't purchased any books yet.</p>
      </div>

      <div className="subscription-section">
        <h3>Subscription Management</h3>
        <p>You are subscribed to Free plan.</p>
        <button className="upgrade-btn">Upgrade to Premium</button>
      </div>

      {isModalOpen && (
        <div id="editProfileModal" className="modal" onClick={(event) => {
          if (event.target.id === 'editProfileModal') setIsModalOpen(false)
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <span className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</span>
            </div>
            <form>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" required />
              </div>
              <hr />
              <h4>Change Password (Optional)</h4>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="password" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" name="password_confirmation" />
              </div>
              <button type="submit" className="save-btn">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileIndex




